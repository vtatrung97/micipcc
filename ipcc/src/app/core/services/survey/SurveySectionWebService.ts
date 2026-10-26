import {Injectable} from "@angular/core";
import {AbstractService} from "@core/services/abstract.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastService} from "@core/services/toast-service";
import {TranslateService} from "@ngx-translate/core";
import {SERVICES} from "@env/environment";
import { Survey } from "@pages/settings/config-template-send-form-message/survey.model";

@Injectable({providedIn: 'root'})
export class SurveySectionWebService  extends AbstractService{
    constructor(private http: HttpClient, private toastSv: ToastService, private translate: TranslateService) {
        super(http, toastSv, translate);
    }

    get SERVICE_URL(): string {
        return SERVICES.TICKET_SERVICE_API.url;
    }

    findSurveyById(surveyId: string) {
        return this.getRequest(this.SERVICE_URL + "/api/v1/survey-web/for-update/" + surveyId);
    }

    updateSurvey(survey: Survey) {
        return this.putRequest(this.SERVICE_URL + "/api/v1/survey-web", survey);
    }

    getActorsUpdateBy() {
        return this.getRequest(this.SERVICE_URL + "/api/v1/survey-web/updators");
    }

    getActorsCreateBy() {
        return this.getRequest(this.SERVICE_URL + "/api/v1/survey-web/creators");
    }

    deleteSurveyById(surveyWebId: string) {
        return this.deleteRequest(this.SERVICE_URL + "/api/v1/survey-web/" + surveyWebId);
    }

    deleteSurveys(surveyWebIds: string[]) {
        return this.deleteRequest(this.SERVICE_URL + "/api/v1/survey-web", surveyWebIds);
    }
}
