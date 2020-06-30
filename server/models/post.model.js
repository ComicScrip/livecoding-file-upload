const db = require('../db.js');
const Joi = require('@hapi/joi');

class Post {
  static validate(attributes, forCreation = true) {
    const schema = Joi.object({
      title: Joi.string().min(1).max(30),
      description: Joi.string().min(1).max(30),
    });
    return schema.validate(attributes, {abortEarly: false, presence: forCreation ? 'required' : 'optional'})
  }

  static async create (newpost) {
    return db.query('insert into posts set ?', newpost)
      .then(res => { newpost.id = res.insertId; return newpost; });
  }

  static async findById (id) {
    return db.query('select * from posts where id = ?', [id])
      .then(rows => rows[0] ? rows[0] : null);
  }

  static async getSome (limit, offset) {
    const total = await db.query('select count(id) as count from posts').then(rows => rows[0].count);
    let sql = 'select * from posts'
    if (limit !== undefined && offset !== undefined) {
      sql = `${sql} limit ${limit} offset ${offset}`
    }

    return db.query(sql).then(rows => ({
      results: rows,
      total
    }));
  }

  static async updateById (id, post) {
    return db.query('UPDATE posts SET ? WHERE id = ?', [post, id]).then(() => this.findById(id));
  }

  static async deleteById (id) {
    return db.query('DELETE FROM posts WHERE id = ?', [id]);
  }
}

module.exports = Post;
