"use strict";

const UserModel = {

  load: async (context, userId) => {
    let req_id = ObjectId(req.params.userId.toString())

    userobj.getUser(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data
        }
    })
  },

  getName: async (context, { userId }) => {
    let req_id = ObjectId(req.params.userId.toString())

    userobj.getUser(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.userName
        }
    })
  },

  getAccount: async (context, { userId }) => {
    let req_id = ObjectId(req.params.userId.toString())

    userobj.getUser(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.account
        }
    })
  },

  getPassword: async (context, { userId }) => {
    let req_id = ObjectId(req.params.userId.toString())

    userobj.getUser(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.pass
        }
    })
  },

  getEmail: async (context, { userId }) => {
    let req_id = ObjectId(req.params.userId.toString())

    userobj.getUser(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.email
        }
    })
  }

 
}

const ProductModel = {
  // load: async (context, productId) => {
  //   if (context.userCache[productId]) {
  //     return context.productCache[productId];
  //   }
  //   const [rows, fields] = await context.db.query('SELECT * FROM product WHERE product_id = ?', [productId]);
  //   context.productCache[productId] = rows;
  //   return rows;
  // },

  load: async (context, productId) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getUser(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data
        }
    })
  },

  getName: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.productName
        }
    })
  },

  getPrice: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.price
        }
    })
  },

  getLocation: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.location
        }
    })
  },

  getSeller: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.seller
        }
    })
  },
  
  getCategory: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.category
        }
    })
  },

  getStartDate: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.startDate
        }
    })
  },

  getEndDate: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.endDate
        }
    })
  },

  getCapacity: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.capacity
        }
    })
  },

  getProductPhoto: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.product_photo
        }
    })
  },

  getDescript: async (context, { productId }) => {
    let req_id = ObjectId(req.params.productId.toString())

    prodobj.getProduct(req_id,(err,data) =>{
        if(err)
        { 
          return null  
        }
        else
        {   
          return data.descript
        }
    })
  },

}



const resolvers = {
  Product: {
    productId: ({ productId }, _, context) => {
      return productId;
    },
    productName: async({ productId }, _, context) => {
      
      return ProductModel.getName(context, { productId });
    },
    price: async({ productId }, _, context) => {
      return ProductModel.getPrice(context, { productId });
    },

    location: async({ productId }, _, context) => {
      return ProductModel.getLocation(context, { productId });
    },

    seller: async({ productId }, _, context) => {
      
      return ProductModel.getSeller(context, { productId });
    },
    
    category: async({ productId }, _, context) => {
      return ProductModel.getCategory(context, { productId });
    },

    startDate: async({ productId }, _, context) => {
      return ProductModel.getStartDate(context, { productId });
    },

    endDate: async({ productId }, _, context) => {
      return ProductModel.getEndtDate(context, { productId });
    },

    capacity: async({ productId }, _, context) => {
      return ProductModel.getCapacity(context, { productId });
    },

    product_photo: async({ productId }, _, context) => {
      return ProductModel.getProductPhoto(context, { productId });
    },
    
    descript: async({ productId }, _, context) => {
      return ProductModel.getDescript(context, { productId });
    }
    
  },
  Query: {
    user: async (_, { userId }, context) => {
      const [rows, fields] = await context.db.query('SELECT user_id AS userId FROM user WHERE user_id = ?', [userId]);
      // console.log("Query user", userId)
      return (rows.length > 0 ? { userId: rows[0].userId } : null);
    },
    users: async (_, { limit = 20, offset = 0, sort = 'ASC' }, context) => {
      const [rows, fields] = await context.db.query('SELECT user_id AS userId FROM user LIMIT ? OFFSET ?', [limit, offset]);
      // console.log("Query users:")
      return rows;
    },
    product: async (_, { productId }, context) => {
      const [rows, fields] = await context.db.query('SELECT product_id AS productId FROM product WHERE product_id = ?', [productId]);
      return (rows.length > 0 ? { productId: rows[0].productId } : null);
    },
    products: async (_, { limit = 20, offset = 0, sort = 'ASC' }, context) => {
      const [rows, fields] = await context.db.query('SELECT product_id AS productId FROM product LIMIT ? OFFSET ?', [limit, offset]);
      return rows;
    },

    history: async (_, { historyId }, context) => {
      // console.log("history", historyId);
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

      const [rows, fields] = await context.db.query('SELECT product_id AS productId FROM product WHERE seller = ?', [userId]);
      return rows.map(({ productId }) => ({ productId: productId }));
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
    },

    reserveDate: async ({ HistoryId }, _, context) => {
      const [rows, fields] = await context.db.query('SELECT reserveDate FROM history WHERE history_id = ?', [HistoryId]);
      return (rows.length === 0 ? null : rows[0].price );
    }

  }

};



module.exports = resolvers;
