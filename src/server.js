require('dotenv').config();
const Hapi = require('@hapi/hapi');
const songs = require('./api/Songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs/index');

const albums = require('./api/Albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums/index');

const users = require('./api/Users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users/index')
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const server = Hapi.server(
    {
      port: process.env.PORT,
      host: process.env.HOST,
      routes: {
        cors: {
          origin: ['*'],
        },
      },
    },
  );

  await server.register([
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
