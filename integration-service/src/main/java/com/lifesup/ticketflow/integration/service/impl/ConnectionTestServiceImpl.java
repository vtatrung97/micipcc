package com.lifesup.ticketflow.integration.service.impl;

import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.i18n.Translator;
import com.lifesup.ticketflow.integration.common.enums.ConnectionTestError;
import com.lifesup.ticketflow.integration.common.enums.ConnectionTestStage;
import com.lifesup.ticketflow.integration.common.exception.IntegrationErrorCode;
import com.lifesup.ticketflow.integration.dto.request.ConnectionTestRequest;
import com.lifesup.ticketflow.integration.dto.response.ConnectionTestResponse;
import com.lifesup.ticketflow.integration.entity.ConnectionEntity;
import com.lifesup.ticketflow.integration.repository.ConnectionRepository;
import com.lifesup.ticketflow.integration.service.ConnectionTestService;
import com.lifesup.ticketflow.integration.validation.ConnectionConfigValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.net.ssl.SNIHostName;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.List;

/**
 * Kiểm tra lần lượt, dừng ở bước lỗi đầu tiên:
 * <ol>
 *   <li>DNS: phân giải host của baseUrl.</li>
 *   <li>TCP: mở kết nối tới host:port.</li>
 *   <li>TLS (https): bắt tay TLS có SNI và kiểm tra hostname của chứng chỉ.</li>
 *   <li>HTTP: gửi HEAD (405/501 thì GET), nhận được bất kỳ status nào (kể cả 401/404) là máy chủ đang chạy.</li>
 * </ol>
 * Không theo redirect, không đọc body, không trả IP đã phân giải. Timeout tối đa {@value #MAX_TIMEOUT_MS} ms mỗi bước.
 */
@Slf4j
@Service
public class ConnectionTestServiceImpl implements ConnectionTestService {

    static final int MAX_TIMEOUT_MS = 10_000;
    static final int DEFAULT_TIMEOUT_MS = 5000;
    static final String MESSAGE_PREFIX = "connection.test.";

    private final ConnectionRepository connectionRepository;
    private final ConnectionConfigValidator validator;
    private final HttpClient httpClient;

    public ConnectionTestServiceImpl(
            ConnectionRepository connectionRepository,
            ConnectionConfigValidator validator) {
        this.connectionRepository = connectionRepository;
        this.validator = validator;
        // Dùng chung một client; timeout từng lần test đặt ở request
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofMillis(MAX_TIMEOUT_MS))
                .build();
    }

    /** Không mở transaction: không giữ kết nối DB trong lúc chờ mạng. */
    @Override
    public ConnectionTestResponse test(Long connectionId) {
        ConnectionEntity connection = connectionRepository.findByIdAndDeletedFalse(connectionId)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.CONNECTION_NOT_FOUND));
        ConnectionTestResponse result = run(connection.getBaseUrl(), connection.getTimeoutMs());
        log.info("Tested connection id={} success={} stage={} durationMs={}",
                connectionId, result.isSuccess(), result.getStage(), result.getDurationMs());
        return result;
    }

    @Override
    public ConnectionTestResponse test(ConnectionTestRequest request) {
        String baseUrl = validator.normalizeBaseUrl(request.getBaseUrl());
        int timeoutMs = request.getTimeoutMs() != null ? request.getTimeoutMs() : DEFAULT_TIMEOUT_MS;
        ConnectionTestResponse result = run(baseUrl, timeoutMs);
        log.info("Tested unsaved connection success={} stage={} durationMs={}",
                result.isSuccess(), result.getStage(), result.getDurationMs());
        return result;
    }

    private ConnectionTestResponse run(String baseUrl, int timeoutMs) {
        long startedAt = System.currentTimeMillis();
        int timeout = Math.min(timeoutMs, MAX_TIMEOUT_MS);
        URI uri = URI.create(baseUrl);
        boolean https = "https".equalsIgnoreCase(uri.getScheme());
        int port = uri.getPort() != -1 ? uri.getPort() : (https ? 443 : 80);

        InetAddress[] addresses;
        try {
            addresses = InetAddress.getAllByName(uri.getHost());
        } catch (UnknownHostException e) {
            return failure(ConnectionTestStage.DNS, ConnectionTestError.DNS_FAILED, startedAt);
        }

        ConnectionTestResponse socketFailure = checkSocket(uri.getHost(), addresses[0], port, https, timeout, startedAt);
        if (socketFailure != null) {
            return socketFailure;
        }
        return checkHttp(uri, timeout, startedAt);
    }

    /** Mở TCP, với https thì bắt tay TLS trên cùng socket. @return null nếu thành công */
    private ConnectionTestResponse checkSocket(
            String host, InetAddress address, int port, boolean https, int timeout, long startedAt) {
        Socket socket = new Socket();
        try {
            socket.connect(new InetSocketAddress(address, port), timeout);
            return https ? handshakeTls(socket, host, port, timeout, startedAt) : null;
        } catch (SocketTimeoutException e) {
            return failure(ConnectionTestStage.TCP, ConnectionTestError.CONNECT_TIMEOUT, startedAt);
        } catch (IOException e) {
            return failure(ConnectionTestStage.TCP, ConnectionTestError.CONNECT_REFUSED, startedAt);
        } finally {
            closeQuietly(socket);
        }
    }

    /** Socket TLS bọc socket TCP đã mở, được đóng cùng socket TCP ở checkSocket. @return null nếu thành công */
    private ConnectionTestResponse handshakeTls(Socket socket, String host, int port, int timeout, long startedAt) {
        try {
            SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            SSLSocket sslSocket = (SSLSocket) factory.createSocket(socket, host, port, true);
            SSLParameters parameters = sslSocket.getSSLParameters();
            parameters.setEndpointIdentificationAlgorithm("HTTPS");
            if (!isIpLiteral(host)) {
                parameters.setServerNames(List.of(new SNIHostName(host)));
            }
            sslSocket.setSSLParameters(parameters);
            sslSocket.setSoTimeout(timeout);
            sslSocket.startHandshake();
            return null;
        } catch (SocketTimeoutException e) {
            return failure(ConnectionTestStage.TLS, ConnectionTestError.CONNECT_TIMEOUT, startedAt);
        } catch (IOException e) {
            // SSLException (chứng chỉ không hợp lệ, sai hostname, không cùng giao thức...) và lỗi I/O khi bắt tay
            return failure(ConnectionTestStage.TLS, ConnectionTestError.TLS_ERROR, startedAt);
        }
    }

    private ConnectionTestResponse checkHttp(URI uri, int timeout, long startedAt) {
        try {
            int status = send(uri, "HEAD", timeout);
            // Một số máy chủ không hỗ trợ HEAD
            if (status == 405 || status == 501) {
                status = send(uri, "GET", timeout);
            }
            return ConnectionTestResponse.builder()
                    .success(true)
                    .httpStatus(status)
                    .durationMs(System.currentTimeMillis() - startedAt)
                    .message(Translator.toLocale(MESSAGE_PREFIX + "SUCCESS"))
                    .testedAt(startedAt)
                    .build();
        } catch (HttpTimeoutException e) {
            return failure(ConnectionTestStage.HTTP, ConnectionTestError.CONNECT_TIMEOUT, startedAt);
        } catch (IOException e) {
            return failure(ConnectionTestStage.HTTP, ConnectionTestError.HTTP_ERROR, startedAt);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return failure(ConnectionTestStage.HTTP, ConnectionTestError.HTTP_ERROR, startedAt);
        }
    }

    /** Gửi request không body, đóng luồng response ngay (không đọc body). */
    private int send(URI uri, String method, int timeout) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(uri)
                .method(method, HttpRequest.BodyPublishers.noBody())
                .timeout(Duration.ofMillis(timeout))
                .build();
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        response.body().close();
        return response.statusCode();
    }

    private static void closeQuietly(Socket socket) {
        try {
            socket.close();
        } catch (IOException e) {
            // Đóng lỗi không ảnh hưởng kết quả test
        }
    }

    private static boolean isIpLiteral(String host) {
        return host.contains(":") || host.matches("\\d{1,3}(\\.\\d{1,3}){3}");
    }

    private static ConnectionTestResponse failure(ConnectionTestStage stage, ConnectionTestError error, long startedAt) {
        return ConnectionTestResponse.builder()
                .success(false)
                .stage(stage)
                .errorCode(error)
                .durationMs(System.currentTimeMillis() - startedAt)
                .message(Translator.toLocale(MESSAGE_PREFIX + error.name()))
                .testedAt(startedAt)
                .build();
    }
}
