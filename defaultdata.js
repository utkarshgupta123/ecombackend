const Products = require("./models/productsSchema");
const productdata = require("./constant/productsdata");

const DefaultData = async()=>{
    try {
        await Products.deleteMany({});
        const storeData = await Products.insertMany(productdata);
        console.log("from defaultdata.js line 8",storeData);
    } catch (error) {
        console.log("error from defaultdata.js line 8" + error.message);
    }
};

module.exports = DefaultData;