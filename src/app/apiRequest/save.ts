import http from "../untils/http";
import { ListSaveJobType,CreateSavejobs, SaveresType } from "../schemaValidations/save.schema"

const ApiRequestSave = {
    CreateSave: (body:CreateSavejobs ) => { 
       return  http.post<SaveresType>(`/save/create`,body)
    },
    getListSaveJobforCandidate: (candidateId: number, sessionToken: string) => {
        return http.get<ListSaveJobType>(`/save/${candidateId}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionToken}`
                }
            });
    },
    DeleteJob : (candidateId:number,jobId:number) =>{
        return http.delete<SaveresType> (`/save/delete/${candidateId}/${jobId}`) 
    }
};

export default ApiRequestSave;
