/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }
// methods to set/get number of guest

set numGuests(val){
  if (val < 1){
    throw new Error('Cannot have fewer than 1 guest', 400)
  } else{
    this._numGuests = val;
  }
}

get numGuests(){
  return this._numGuests;
}

// methods to set/get startAt time

set startAt(num){
  if(num instanceof Date && !isNaN(num)){
    this._startAt = num;
  } else{
    throw new Error('Not a valid startAt time.');
  }
}

get startAt(){
  return this._startAt;
}
  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }
// methods for set/get notes

set notes(val){
  this._notes = val || '';
}

get notes(){
  return this._notes;
}

// methods to set/get customer id

set customerId(num){
  if(this._customerId && this._customerId !== num){
    throw new Error("Cannot change ID");
  }else{
    this._customerId = num;
  }
}

get customerId(){
  return this._customerId;
}
  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }
// find a reservation using the id

  static async get(id){
    const result = await db.query(`
      SELECT id, customer_id AS 'customerID',
      numGuests AS "numGuests,
      start_at AS "startAt,
      notes
      FROM reservations
      WHERE id = $1`, [id]);

      let reservation = results.row[0];

      if (reservation === undefined){
        const err = new Error(`Reservation is invalid: ${id}`);
        err.status = 404;
        throw err;
      }
      return new Reservation(reservation);
  }
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, num_guests, start_at, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.numGuests, this.startAt, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations SET num_guests=$1, start_at=$2, notes=$3
             WHERE id=$4`,
        [this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}


module.exports = Reservation;
