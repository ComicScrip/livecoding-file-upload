const Post = require('../models/post.model.js');
const {tryParseInt}  = require('../helpers/number')

class postController {
  static async create (req, res) {
    const {title, content} = req.body;
    const main_picture_url = null
    const createdPost = await Post.create({title, content, main_picture_url})
    res.status(201).send(createdPost)
  }

  static async findAll (req, res) {
    const page = tryParseInt(req.query.page, 1);
    const per_page = tryParseInt(req.query.per_page, 30);
    const {results, total} = await Post.getSome(per_page, (page - 1) * per_page)
    const rangeEnd = page * per_page;
    const rangeBegin = rangeEnd - per_page + 1;
    res.header('content-range', `${rangeBegin}-${rangeEnd}/${total}`)
    res.send(results)
  }

  static async delete (req, res) {
    const {id} = req.params
    const existingpost = await Post.findById(id)
    if (!existingpost) {
      return res.sendStatus(404)
    }
    await post.deleteById(id)
    res.sendStatus(204)
  }
}

module.exports = postController;
