import api from './api';

export const uploadService = {
  /**
   * Upload a file (image, video, document) via multipart/form-data.
   * @param {File|Blob} file 
   * @param {string} folder - 'places', 'events', 'gallery', 'avatars', 'uploads'
   * @returns {Promise<object>}
   */
  async uploadFile(file, folder = 'uploads') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  },

  /**
   * Upload a base64 Data URI to store as a file in the backend.
   * @param {string} dataUrl 
   * @param {string} folder 
   * @returns {Promise<object>}
   */
  async uploadBase64(dataUrl, folder = 'uploads') {
    const res = await api.post('/upload', {
      data_url: dataUrl,
      folder: folder,
    });
    return res;
  }
};

export default uploadService;
