const request = require('supertest');
const app = require('../server.js');
const Task = require('../models/task.model.js');
const _ = require('lodash');

describe('tasks endpoints', () => {
  describe('POST /tasks', () => {
    describe('when the payload is valid', () => {
      it('returns 201 status code and the updated object when everything is provided', async () => {
        const validTask = {name: "do something", done: true};
        return request(app).post('/tasks').send(validTask).expect(201).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('id')
          expect(res.body.name).toBe("do something")
          expect(res.body.done).toBe(true)
        })  
      })

      it('returns 201 status code and the created object with "done" set to false by default', async () => {
        const validTask = {name: "do something"};
        return request(app).post('/tasks').send(validTask).expect(201).then(res => {
          expect(res.body.done).toBe(false)
        })
      })
    })

    describe('when the payload is not valid', () => {
      it('returns 422 status and error details when nothing is provided', async () => {
          const inValidTask = {};
          return request(app).post('/tasks').send(inValidTask).expect(422).then(res => {
            expect(_.isPlainObject(res.body))
            expect(res.body).toHaveProperty('errorMessage')
            expect(res.body).toHaveProperty('errorDetails')
          })
      })

      it('returns 422 status and error details when name is empty', async () => {
        const inValidTask = {name: ""};
        return request(app).post('/tasks').send(inValidTask).expect(422).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('errorMessage')
          expect(res.body).toHaveProperty('errorDetails')
        })
      })

      it('returns 409 status and error details when name is already taken by another task', async () => {
        await Task.create({name: "same"});
        const inValidTask = {name: "same"};
        return request(app).post('/tasks').send(inValidTask).expect(409).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('errorMessage')
        })
      })
    })
  });

  describe('GET /tasks', () => {
    it('returns 200 status and tasks with the right attributes', async () => {
      await Task.create({name: "one"});
      await Task.create({name: "two", done: true});
      return request(app).get('/tasks').expect(200).then(res => {
        expect(res.body.length).toBe(2);
        res.body.forEach((task) => {
          expect(_.isPlainObject(res.body))
          expect(task).toHaveProperty('id')
          expect(task).toHaveProperty('name')
          expect(task).toHaveProperty('done')
          expect(typeof task.done).toBe('boolean')
        })
      })
    })

    it('handles pagination', async () => {
      await Task.create({name: "one"});
      await Task.create({name: "two"});
      await Task.create({name: "three"});
      await Task.create({name: "four"});
      await Task.create({name: "five"});

      return Promise.all([
        request(app).get('/tasks?per_page=2&page=1').expect(200).then(res => {
          expect(res.body.length).toBe(2);
          expect(res.header['content-range']).toBe('1-2/5')
        }),
        request(app).get('/tasks?per_page=2&page=2').expect(200).then(res => {
          expect(res.body.length).toBe(2);
          expect(res.header['content-range']).toBe('3-4/5')
        })
      ])
    })
  });

  describe('PATCH /tasks/:id', () => {
    describe('when the payload is valid', () => {
      it('returns 200 status code and the created object when everything is provided', async () => {
        const t = await Task.create({name: "do something", done: true});
        const validPayload = {name: "do something else", done: false}
        return request(app).patch('/tasks/' + t.id).send(validPayload).expect(200).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('id')
          expect(res.body.name).toBe("do something else")
          expect(res.body.done).toBe(false)
        })
      })

      it('returns 200 status code and the created object when name is not provided', async () => {
        const t = await Task.create({name: "do something", done: true});
        const validPayload = {done: false}
        return request(app).patch('/tasks/' + t.id).send(validPayload).expect(200).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('id')
          expect(res.body.name).toBe("do something")
          expect(res.body.done).toBe(false)
        })
      })
    })

    describe('when the payload is not valid', () => {
      it('returns 422 status and error details when name is empty', async () => {
        const inValidTask = {name: ""};
        return request(app).post('/tasks').send(inValidTask).expect(422).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('errorMessage')
          expect(res.body).toHaveProperty('errorDetails')
        })
      })

      it('returns 409 status and error details when name is already taken by another task', async () => {
        await Task.create({name: "same"});
        const inValidTask = {name: "same"};
        return request(app).post('/tasks').send(inValidTask).expect(409).then(res => {
          expect(_.isPlainObject(res.body))
          expect(res.body).toHaveProperty('errorMessage')
        })
      })
    })

    describe('When given task id does not exist', () => {
      it('returns 404', async () => {
        const validPayload = {done: false}
        await request(app).patch('/tasks/123').send(validPayload).expect(404)
      })
    })
  });
});
