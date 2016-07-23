'use strict';
describe('pos', function () {

  describe('should have amount', function () {
    it('format first', function () {
      let tags = [
        'ITEM000001',
        'ITEM000003-2.5',
        'ITEM000005',
        'ITEM000005-2',
      ];
      let actual = formatTags(tags);
      expect(actual).toEqual([
        {
          barcode: 'ITEM000001',
          amount: 1
        },
        {
          barcode: 'ITEM000003',
          amount: 2.5
        },
        {
          barcode: 'ITEM000005',
          amount: 1
        },
        {
          barcode: 'ITEM000005',
          amount: 2
        }
      ]);
    });
    it('format second', function () {
      let formattedTags = [
        {
          barcode: 'ITEM000001',
          amount: 1
        },
        {
          barcode: 'ITEM000003',
          amount: 2.5
        },
        {
          barcode: 'ITEM000005',
          amount: 1
        },
        {
          barcode: 'ITEM000005',
          amount: 2
        }
      ];

      let actual = mergeBarcode(formattedTags);
      expect(actual).toEqual([
        {
          barcode: 'ITEM000001',
          amount: 1
        },
        {
          barcode: 'ITEM000003',
          amount: 2.5
        },
        {
          barcode: 'ITEM000005',
          amount: 3
        }
      ]);
    });
  });


  it('should get promoting barcodes information', function () {
    let barcodeAmountList = [
      {
        barcode: 'ITEM000001',
        amount: 5
      },
      {
        barcode: 'ITEM000003',
        amount: 2.5
      },
      {
        barcode: 'ITEM000005',
        amount: 3
      }

    ];

    let actual = getPromotingInfo(barcodeAmountList, loadPromotions());

    expect(actual).toEqual([
      {
        barcode: 'ITEM000001',
        type: 'BUY_TWO_GET_ONE_FREE'

      },
      {
        barcode: 'ITEM000005',
        type: 'BUY_TWO_GET_ONE_FREE'
      }
    ]);

  });

  it('should get originSubTotalCartItems', function(){
    let barcodeAmountList = [
      {
        barcode: 'ITEM000001',
        amount: 5
      },
      {
        barcode: 'ITEM000003',
        amount: 2.5
      },
      {
        barcode: 'ITEM000005',
        amount: 3
      }

    ];

    let actual = calculateOriginSubTotalCartItems(barcodeAmountList, loadAllItems());
    expect(actual).toEqual([
      {
        barcode: 'ITEM000001',
        name: '雪碧',
        unit: '瓶',
        price: 3.00,
        amount: 5,
        originSubTotal: 15.00
      },
      {
        barcode: 'ITEM000003',
        name: '荔枝',
        unit: '斤',
        price: 15.00,
        amount: 2.5,
        originSubTotal: 37.50
      }
      ,
      {
        barcode: 'ITEM000005',
        name: '方便面',
        unit: '袋',
        price: 4.50,
        amount: 3,
        originSubTotal: 13.50
      }
    ]);
  });
  it('should get discountedSubTotalCartItems', function(){
    let promotingInfo = [
      {
        barcode: 'ITEM000001',
        type: 'BUY_TWO_GET_ONE_FREE'
      },
      {
        barcode: 'ITEM000005',
        type: 'BUY_TWO_GET_ONE_FREE'
      }
    ];
    let originSubTotalCartItems = [
      {
        barcode: 'ITEM000001',
        name: '雪碧',
        unit: '瓶',
        price: 3.00,
        amount: 5,
        originSubTotal: 15.00
      },
      {
        barcode: 'ITEM000003',
        name: '荔枝',
        unit: '斤',
        price: 15.00,
        amount: 2.5,
        originSubTotal: 37.50
      }
      ,
      {
        barcode: 'ITEM000005',
        name: '方便面',
        unit: '袋',
        price: 4.50,
        amount: 3,
        originSubTotal: 13.50
      }
    ];
    let actual = calculateDiscountedSubTotalCartItems(promotingInfo, originSubTotalCartItems);
    expect(actual).toEqual([
      {
        barcode: 'ITEM000001',
        name: '雪碧',
        unit: '瓶',
        price: 3.00,
        amount: 5,
        originSubTotal: 15.00,
        discountedSubTotal: 12.00
      },
      {
        barcode: 'ITEM000003',
        name: '荔枝',
        unit: '斤',
        price: 15.00,
        amount: 2.5,
        originSubTotal: 37.50,
        discountedSubTotal: 37.50
      }
      ,
      {
        barcode: 'ITEM000005',
        name: '方便面',
        unit: '袋',
        price: 4.50,
        amount: 3,
        originSubTotal: 13.50,
        discountedSubTotal: 9.00

      }
    ]);
  });

  it('should get origin total price', function () {

    let discountedSubTotalCartItems = [
      {
        "barcode": "ITEM000001",
        "name": "雪碧",
        "unit": "瓶",
        "price": 3,
        "amount": 5,
        "originSubTotal": 15,
        "discountedSubTotal": 12
      },
      {
        "barcode": "ITEM000003",
        "name": "荔枝",
        "unit": "斤",
        "price": 15,
        "amount": 2.5,
        "originSubTotal": 37.5,
        "discountedSubTotal": 37.5
      },
      {
        "barcode": "ITEM000005",
        "name": "方便面",
        "unit": "袋",
        "price": 4.5,
        "amount": 3,
        "originSubTotal": 13.5,
        "discountedSubTotal": 9
      }
    ];
    let actual = calculateOriginTotalPrice(discountedSubTotalCartItems);
    let expected = 66;

    expect(actual).toEqual(expected);

  });

  it('should get discount', function () {
    let discountedSubTotalCartItems = [
      {
        "barcode": "ITEM000001",
        "name": "雪碧",
        "unit": "瓶",
        "price": 3,
        "amount": 5,
        "originSubTotal": 15,
        "discountedSubTotal": 12
      },
      {
        "barcode": "ITEM000003",
        "name": "荔枝",
        "unit": "斤",
        "price": 15,
        "amount": 2.5,
        "originSubTotal": 37.5,
        "discountedSubTotal": 37.5
      },
      {
        "barcode": "ITEM000005",
        "name": "方便面",
        "unit": "袋",
        "price": 4.5,
        "amount": 3,
        "originSubTotal": 13.5,
        "discountedSubTotal": 9
      }
    ];

    let discount = calculateDiscount(discountedSubTotalCartItems);

    let expected = 7.5;

    expect(discount).toEqual(expected);
  });


  it('should print correct receipt text', function () {
    let tags = [
      'ITEM000001',
      'ITEM000001',
      'ITEM000001',
      'ITEM000001',
      'ITEM000001',
      'ITEM000003-2.5',
      'ITEM000005',
      'ITEM000005-2',
    ];

    spyOn(console, 'log');


    printReceipt(tags);

    let expectText = `***<没钱赚商店>收据***
名称：雪碧，数量：5瓶，单价：3.00(元)，小计：12.00(元)
名称：荔枝，数量：2.5斤，单价：15.00(元)，小计：37.50(元)
名称：方便面，数量：3袋，单价：4.50(元)，小计：9.00(元)
----------------------
总计：58.50(元)
节省：7.50(元)
**********************`;

    expect(console.log).toHaveBeenCalledWith(expectText);

  })
});