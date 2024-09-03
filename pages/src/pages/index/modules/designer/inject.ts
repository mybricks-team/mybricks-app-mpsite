import axios from 'axios';
import { message } from 'antd';

const upload = async (files, uploadConfig) => {

  const API = `${uploadConfig.baseURL || ""}/paas/api/oss/uploadFile`;

  const formData = new FormData();
  formData.append('file', files[0]);

  let res = await axios.post(API, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  let { data } = res.data;
  return [data.url];
}


const inject = (editConfig: Record<string, any>) => {
  if (!!editConfig && !editConfig.upload) {
    editConfig.upload = upload;
  }
};

export { inject };
