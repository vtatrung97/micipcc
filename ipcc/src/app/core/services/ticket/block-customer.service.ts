import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "@core/services/auth/auth.service";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import {CustomerBlacklist} from "@core/models/customer/customer-blacklist.model";

@Injectable({providedIn: 'root'})
export class BlockCustomerService extends AbstractService {
  constructor(private http: HttpClient,
              private authSvc: AuthService,
              private toastSvc: ToastService,
              private translate: TranslateService) {
    super(http, toastSvc, translate);
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/black-list`;
  }

  public blockCustomersFromFile(filePath: string, customers: CustomerBlacklist[], blockOrUnblock: 'block' | 'unblock') {
    if(blockOrUnblock === 'block' )
      return this.postRequest(`${this.SERVICE_URL}/${'add-file'}?filePath=${filePath}`, customers);
    else
      return this.deleteRequest(`${this.SERVICE_URL}/${'delete-file'}?filePath=${filePath}`, customers);
  }

  public validateBlockCustomers(blockRange: number, formData: any) {
    return this.postRequest(`${this.SERVICE_URL}/validate-file?blockRange=${blockRange}`, formData)
  }
}
