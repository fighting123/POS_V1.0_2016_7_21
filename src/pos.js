'use strict'
function formatTags(tags) {
  return tags.map(function(tag){
    let tagPart = tag.split('-');
    return {
      barcode: tagPart[0],
      amount: Number.parseFloat(tagPart[1]) || 1
    }
  });
}


function mergeBarcode(formattedTags) {
  return formattedTags.reduce((mergedBarcodes, cur) => {
    let found = mergedBarcodes.find(entry => entry.barcode === cur.barcode);
    if (found) {
      found.amount += cur.amount;
    } else {
      mergedBarcodes.push(Object.assign({}, cur));
    }
    return mergedBarcodes;

  }, []);
}
function getPromotingInfo(barcodeAmountList,allPromotions) {
  let promotingInfo = [];
  for (let promotion of allPromotions) {
    let promotingBarcodeAmountList = barcodeAmountList.filter(function(entry){
      return promotion.barcodes.indexOf(entry.barcode) > -1;
    });
    for (let ba of promotingBarcodeAmountList) {
      promotingInfo.push(Object.assign({}, {barcode: ba.barcode}, {type: promotion.type}));
    }
  };
  return promotingInfo;
};

function calculateOriginSubTotalCartItems(barcodeAmountList,allItems){
  return barcodeAmountList.reduce(function(originSubTotalCarItems,entry){
    let found = allItems.find(function(item){
      return entry.barcode === item.barcode;
    })
    if(found){
      originSubTotalCarItems.push(Object.assign({},found,{
        amount:entry.amount,
        originSubTotal:found.price * entry.amount
      }));
    }
    return originSubTotalCarItems;
  },[])
}


function calculateDiscountedSubTotalCartItems(promotingInfo, originSubTotalCartItems) {
  let discountedSubTotalCartItems = [];

  for (let item of originSubTotalCartItems) {
    let found = promotingInfo.find(
      entry => item.barcode === entry.barcode
    );
    if (found) { 
      if (found.type === 'BUY_TWO_GET_ONE_FREE') {
        let amount;
        for (amount = item.amount; amount - 2 >= 1; amount -= 2) {
          amount--;
        }
        amount += 2;
        let disountedAmount = item.amount - amount;
        let discount = disountedAmount * item.price;
        discountedSubTotalCartItems.push(Object.assign({}, item, {discountedSubTotal: item.originSubTotal - discount}));
      }
    } else {
      discountedSubTotalCartItems.push(Object.assign({}, item, {discountedSubTotal: item.originSubTotal}));
    }
  }
  return discountedSubTotalCartItems;
}
function calculateOriginTotalPrice(discountedSubTotalCartItems) {
  return discountedSubTotalCartItems.reduce((originSubTotal, item)=> {
    return originSubTotal += item.originSubTotal;
  }, 0);
}
function calculateDiscount(discountedSubTotalCartItems) {
  return discountedSubTotalCartItems.reduce((discount, item) => {
    return discount += item.originSubTotal - item.discountedSubTotal;
  }, 0);
}
function generateReceipt(discountedSubTotalCartItems, originTotalPrice, discount) {

  function generateHeader() {
    return '***<没钱赚商店>收据***\n';
  }

  function generateBody(discountedSubTotalCartItems) {
    let body = '';

    for (let item of discountedSubTotalCartItems) {
      let itemReceipt = '名称：' + item.name +
        '，数量：' + item.amount + item.unit +
        '，单价：' + item.price.toFixed(2) +
        '(元)，小计：' + item.discountedSubTotal.toFixed(2) + '(元)\n';
      body = body.concat(itemReceipt);
    }
    return body;
  }

  function generateFooter(originTotalPrice, discount) {
    return '----------------------\n' +
      '总计：' + (originTotalPrice - discount).toFixed(2) + '(元)\n' +
      '节省：' + discount.toFixed(2) + '(元)\n' +
      '**********************';
  }

  let receipt = '';
  let header = generateHeader();
  let body = generateBody(discountedSubTotalCartItems);
  let footer = generateFooter(originTotalPrice, discount);

  receipt = receipt.concat(header).concat(body).concat(footer);

  return receipt;


}


function printReceipt(tags) {

  let allItems = loadAllItems();
  let allPromotions = loadPromotions();
  let priceAndAmount = formatTags(tags);
  let barcodeAmountList = mergeBarcode(priceAndAmount);
  let promotingInfo = getPromotingInfo(barcodeAmountList, allPromotions);
  let originSubTotalCartItems = calculateOriginSubTotalCartItems(barcodeAmountList, allItems);
  let discountedSubTotalCartItems = calculateDiscountedSubTotalCartItems(promotingInfo, originSubTotalCartItems);
  let originTotalPrice = calculateOriginTotalPrice(discountedSubTotalCartItems);
  let discount = calculateDiscount(discountedSubTotalCartItems);
  let receipt = generateReceipt(discountedSubTotalCartItems, originTotalPrice, discount);
  console.log(receipt);
}