console.log("beginaaa2->");
function getQueryString(name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}
try {
  console.log("resaa->", aa);
  window.itemInfo = {
    orderId: location.search.replace("?purchaseNo=", ""),
    infoItems: {},
  };
  aa.then((res) => {
    let rows = res?.data?.rows;
    let items = [];
    rows.forEach((row) => {
      let curRowItems = row.items?.map((item) => {
        return {
          goodsName: item.goodsName,
          nums: item.nums,
          goodsAttributeCn: item.goodsAttributeCn,
          itemQcTipsContent: item.itemQcTipsContent,
          goodsImg: item.goodsImg,
          unitPrice: item.unitPrice,
          totalPostage: row.totalPostage || row.postageAmount || row.postage,
          _postageAmount: row.postageAmount,
          _postage: row.postage,
          _totalPostage: row.totalPostage,
          _goodsAmount: row.goodsAmount,
          _goodsFilAmount: row.goodsFilAmount,
          caigouyuan: row.Carol || row.buyer, // 采购员
          goodsAmountTotal: row.goodsAmountTotal,
          trackListAttribute: item.trackList.filter(
            (trackItem) => trackItem.content.indexOf("下单") !== -1
          )[0]?.content,
          trackList: item.trackList,
          trackCategory: item.trackList.map((trackItem) => trackItem.category),
          allTrack: item.trackList.map((item) => item.content),
          orderNo: item.orderNo,
          purchaseNo: item.purchaseNo, // 随后需要判断 相同 purchaseNo 中是否有不同的 orderNo (多人混合单子的情况)
        };
      });
      items = items.concat(curRowItems);
    });
    console.log("items---->", items);
    let pd_items = window.pd_items;
    // pd_items {orderId: items[]};
    let orderNum = e.purchaseNo;
    if (pd_items == null) {
      pd_items = { [`pdid_${orderNum}`]: items };
      // localStorage.setItem('pd_items', JSON.stringify(pd_items))
      window.pd_items = pd_items;
    } else {
      // pd_items = JSON.parse(pd_items);
      pd_items[`pdid_${orderNum}`] = items;
      // localStorage.setItem('pd_items', JSON.stringify(pd_items))
      window.pd_items = pd_items;
    }
    console.log("当前采集", e.purchaseNo, window.pd_items);
  });
} catch (error) {
  console.log("采集异常-->", error);
}
