const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/balance';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDAsIm5hbWUiOiJVc2VyICMzIiwibWFpbCI6InVzZXIzQG1haWwuY29tIn0.haEEjbmL_75BKW-tuVDBSXW9djjQoTfH6t-5ot0cwP4';
const TOKEN_GERAL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxMDIsIm5hbWUiOiJVc2VyICM1IiwibWFpbCI6InVzZXI1QG1haWwuY29tIn0.h1wvHEq-Ij_uqPhRh3m9W97fX-WTYRITjQRpur48iYg';

beforeAll(async () => {
  await app.db.seed.run();
});

describe('Ao calcular o saldo do usuário...', () => {
  test('Deve retornar apenas as contas com alguma transação', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
      });
  });

  test('Deve adicionar valores de entrada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: new Date(), ammount: 100, type: 'I', acc_id: 10100, status: true })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('100.00');
          });
      });
  });

  test('Deve subtrair valores de saída', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 10100, status: true })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });

  test('Não deve considerar transações pendentes', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 10100, status: false })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
          });
      });
  });

  test('Não deve considerar saldo de contas distintas', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: new Date(), ammount: 50, type: 'I', acc_id: 10101, status: true })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Não deve considerar contas de outros usuários', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: new Date(), ammount: 200, type: 'O', acc_id: 10102, status: true })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Deve considerar transação passada', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: moment().subtract({ days: 5 }), ammount: 250, type: 'I', acc_id: 10100, status: true })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Não deve considerar transação futura', () => {
    return request(app).post(ROUTE_TRANSACTION)
      .send({ description: '1', date: moment().add({ days: 5 }), ammount: 250, type: 'I', acc_id: 10100, status: true })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('150.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('50.00');
          });
      });
  });

  test('Deve considerar transferências', () => {
    return request(app).post(ROUTE_TRANSFER)
      .send({ description: '1', date: new Date(), ammount: 250, acc_ori_id: 10100, acc_dest_id: 10101 })
      .set('authorization', `bearer ${TOKEN}`)
      .then(() => {
        return request(app).get(MAIN_ROUTE)
          .set('authorization', `bearer ${TOKEN}`)
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].id).toBe(10100);
            expect(res.body[0].sum).toBe('-100.00');
            expect(res.body[1].id).toBe(10101);
            expect(res.body[1].sum).toBe('300.00');
          });
      });
  });
});

test('Deve calcular saldo das contas do usuário', () => {
  return request(app).get(MAIN_ROUTE)
    .set('authorization', `bearer ${TOKEN_GERAL}`)
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(10104);
      expect(res.body[0].sum).toBe('162.00');
      expect(res.body[1].id).toBe(10105);
      expect(res.body[1].sum).toBe('-248.00');
    });
});
