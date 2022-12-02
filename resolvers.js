"use strict";

const UserModel = {
  load: async (context, userId) => {
    if (context.userCache[userId]) {
      return context.userCache[userId];
    }

    const user_data = await context.db.collection('users').findOne(ObjectId(userId))
    context.userCache[userId] = user_data;
    return user_data;
  },

  getName: async (context, { userId }) => {
    const rows = await UserModel.load(context, userId);
    return (rows.length === 0 ? null : rows[0].userName);
  },

  getAccount: async (context, { userId }) => {
    const rows = await UserModel.load(context, userId);
    return (rows.length === 0 ? null : rows[0].account);
  },

  getPassword: async (context, { userId }) => {
    const rows = await UserModel.load(context, userId);
    return (rows.length === 0 ? null : rows[0].pass);
  },

  getEmail: async (context, { userId }) => {
    const rows = await UserModel.load(context, userId);
    return (rows.length === 0 ? null : rows[0].email);
  }
}

const carModel = {
  load: async (context, carId) => {
    if (context.userCache[carId]) {
      return context.productCache[carId];
    }
    // const [rows, fields] = await context.db.query('SELECT * FROM product WHERE product_id = ?', [carId]);
    const car_data = await context.db.collection('product').findOne(ObjectId(carId))
    context.productCache[carId] = car_data;
    return car_data;
  },

  getcarName: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].carName);
  },
  getPrice: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].price);
  },
  getOwner: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : { userId: rows[0].owner });
  },
  getManufacturer: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].manufacturer);
  },
  getvehicleType: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].vehicleType);
  },
  getCapacity: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].capacity);
  },
  gettransmissionStyle: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].transmissionStyle);
  },
  getcarDates: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].car_dates);
  },
  getcarPhoto: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].car_photo);
  },
  getLookLike: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].look_like);
  },
  getcoord: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].coord);
  },
  getDescript: async (context, { carId }) => {
    const rows = await carModel.load(context, carId);
    return (rows.length === 0 ? null : rows[0].descript);
  }
}

const resolvers = {
  Product: {
    carId: ({ carId }, _, context) => {
      return carId;
    },
    carName: async({ carId }, _, context) => {
      return carModel.getcarName(context, { carId });
    },
    price: async({ carId }, _, context) => {
      return carModel.getPrice(context, { carId });
    },
    owner: async({ carId }, _, context) => {
      return carModel.getOwner(context, { carId });
    },
    manufacturer: async({ carId }, _, context) => {
      return carModel.getManufacturer(context, { carId });
    },
    vehicleType: async({ carId }, _, context) => {
      return carModel.getvehicleType(context, { carId });
    },
    capacity: async({ carId }, _, context) => {
      return carModel.getCapacity(context, { carId });
    },
    transmissionStyle: async({ carId }, _, context) => {
      return carModel.gettransmissionStyle(context, { carId });
    },
    car_photo: async({ carId }, _, context) => {
      return carModel.getcarPhoto(context, { carId });
    },
    car_dates: async({ carId }, _, context) => {
      return carModel.getcarDates(context, { carId });
    },
    look_like: async({ carId }, _, context) => {
      return carModel.getLookLike(context, { carId });
    },
    coord: async({ carId }, _, context) => {
      return carModel.getcoord(context, { carId });
    },
    descript: async({ carId }, _, context) => {
      return carModel.getDescript(context, { carId });
    }
  },

  Query: {
    user: async (_, { userId }, context) => {
      const rows = await context.db.collection('users').findOne(ObjectId(userId))
      return (rows.length > 0 ? { userId: rows[0].userId } : null);
    },
    users: async (_, { limit = 20, offset = 0, sort = 'ASC' }, context) => {
      const rows = await context.db.collection('users').find({})
      return rows;
    },
    product: async (_, { carId }, context) => {
      const rows = await context.db.collection('product').find(ObjectId(carId))
      return (rows.length > 0 ? { carId: rows[0].carId } : null);
    },
    products: async (_, { limit = 20, offset = 0, sort = 'ASC' }, context) => {
      const rows = await context.db.collection('product').find({})
      return rows;
    },
    history: async (_, { historyId }, context) => {
      const [rows, fields] = await context.db.query('SELECT history_id AS historyId FROM history WHERE history_id = ?', [historyId]);
      return (rows.length > 0 ? { historyId: rows[0].historyId } : null);
    },
    historys: async (_, { limit = 20, offset = 0, sort = 'ASC' }, context) => {
      const [rows, fields] = await context.db.query('SELECT history_id AS historyId FROM history LIMIT ? OFFSET ?', [limit, offset]);
      return rows;
    },

  },
  Mutation: {
    updateUser: async(_, { userId, account, email }, context) => {
      let q = '';
      let d = [];
      if(account && !email ) {
        q = 'UPDATE user SET account = ? WHERE user_id = ?';
        d = [account, userId];
      }
      else if(!account  && email ) {
        q = 'UPDATE user SET email = ? WHERE user_id = ?';
        d = [email, userId];
      }
      else {
        q = 'UPDATE user SET account = ?, email = ? WHERE user_id = ?';
        d = [account, email, userId];
      }
      const [rows, fields] = await context.db.query(q, d);
      return rows
    }
  },
  User: {
    userName: async ({ userId }, _, context) => {
      return UserModel.getName(context, { userId });
    },
    userId: ({ userId }, _, context) => {
      return userId;
    },
    account: async ({ userId }, _, context) => {
      return UserModel.getAccount(context, { userId });
    },
    pass: async ({ userId }, _, context) => {
      return UserModel.getPassword(context, { userId });
    },
    email: async ({ userId }, _, context) => {
      return UserModel.getEmail(context, { userId });
    },
    products: async ({ userId }, _, context) => {

      const [rows, fields] = await context.db.query('SELECT product_id AS carId FROM product WHERE seller = ?', [userId]);
      return rows.map(({ carId }) => ({ carId: carId }));
    },
    buyProducts: async ({ userId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT history_id AS HistoryId FROM history WHERE buyer = ?', [userId]);
      return rows.map(({ HistoryId }) => ({ HistoryId: HistoryId }));
    }
    
  },
  History: {
    buyer: async ({ HistoryId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT buyer FROM history WHERE history_id = ?', [HistoryId]);
      return (rows.length === 0 ? null : rows[0].buyer);
      
    },
    buy_at: async ({ HistoryId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT buy_at FROM history WHERE history_id = ?', [HistoryId]);

      return (rows.length === 0 ? null : rows[0].buy_at.toISOString().substring(0, 10) );
      
    },
    num: async ({ HistoryId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT num FROM history WHERE history_id = ?', [HistoryId]);
      return (rows.length === 0 ? null : rows[0].num );
    },
    product_name: async ({ HistoryId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT product_name FROM history WHERE history_id = ?', [HistoryId]);
      return (rows.length === 0 ? null : rows[0].product_name );
    },
    price: async ({ HistoryId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT price FROM history WHERE history_id = ?', [HistoryId]);
      return (rows.length === 0 ? null : rows[0].price );
    }

  }

};



module.exports = resolvers;
