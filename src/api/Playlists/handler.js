/* eslint no-underscore-dangle: 0 */
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    this._validator.validatePlaylistPayload(request.payload);

    const playlistId = await this._service.addPlaylist(name, owner);
        
    const response = h.response({
      status: 'success',
      message: 'Playlists berhasil ditambahkan',
      data: {
          playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const Hasil = await this._service.getPlaylists(credentialId);
    
    return {
      status: 'success',
      data: {
        playlists: Hasil,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
