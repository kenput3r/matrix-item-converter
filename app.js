const csv = require('csvtojson');
const utils = require('./utils');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './files/output.csv',
  header: utils.Headers
});

const records = {};

(async () => {
  const products = await csv().fromFile(`./files/Dear.csv`);
  // const bom = await csv().fromFile(`./files/${process.argv[3]}`);
  const shopify_wholesale_file = await csv().fromFile(`./files/ShopifyWholesale.csv`);
  const shopify_retail_file = await csv().fromFile(`./files/ShopifyRetail.csv`);
  const shopify_retail_items = utils.FormatShopifyObject(shopify_retail_file);
  const shopify_wholesale_items = utils.FormatShopifyObject(shopify_wholesale_file);

  for(let i = 0; i < products.length; i++) {
    const product = products[i];
    //If the item is a Subitem (belongs to a family)
    if(product[`ProductFamilySKU`]) {
      //If the item Parent isn't in records yet
      if(!records[product[`ProductFamilySKU`]]) {
        const FamilySKU = product[`ProductFamilySKU`];
        const FamilyName = product[`ProductFamilyName`];
        const Weight = product[`Weight`];
        const WeightUnits = product[`WeightUnits`];
        const Category = product[`Category`];
        const SKU = product[`ProductCode`];
        const ProductName = product[`Name`];
        records[product[`ProductFamilySKU`]] = utils.CreateMatrixParent(FamilySKU, FamilyName, Weight, WeightUnits, Category, SKU, ProductName);
      }
      //Create the Subitem
      records[product[`ProductCode`]] = utils.CreateObject(product, shopify_retail_items, shopify_wholesale_items);
    }else{

    }
  }
  //convert records object to array
  const records_array = Object.values(records);
  csvWriter.writeRecords(records_array);
})();