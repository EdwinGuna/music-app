const { Pool } = require('pg');
const nanoid = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylist({ name, credentialId: owner }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);
        //if (!result.rows[0].id) {
        if (!result.rowCount) {
            throw new InvariantError('playlists gagal ditambahkan');
        }
        
        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username
                    FROM playlists INNER JOIN
                    users ON playlists.owner = users.id
                    WHERE playlists.owner = $1`,
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows;
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const ownerdb = result.rows[0].owner;
        
        if (ownerdb !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async deletePlaylistById({ id }) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        }
        const result = await this._pool.query(query);
        if (result.rows.length > 0) {
            const query = {
                text: 'DELETE FROM playlists WHERE id = $1',
                values: [id],
            }
        }
    }
}

module.exports = PlaylistsService;
