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

/////////////////
window.loadOrderDetail = d;
function doExcute() {
  // beginstart-----
  let special_charts = [
    "𝐂𝐡",
    "🇫🇷",
    "✨",
    "🉐",
    "🐮",
    "🔥🔥",
    "🔥",
    "👑",
    "🚀🚀",
    "🚀",
    "🔑",
    "💰",
    "🔗",
    "✔️",
    "🎲",
    "👓",
    "🖤",
    "💀",
    "👐",
    "💯",
    "💥",
    "🚶🏻",
    "🏅",
    "🎖",
    "🏵",
    "⚡",
    "☀",
  ];

  /**
   * 根据po订单id获取pi订单信息
   * @param {*} POOrderID
   * @returns
   */
  async function getPiInfosByOrderId(POOrderID) {
    const param = {
      pageNum: 1,
      pageSize: 1000,
      buyer: null,
      orderStatus: null,
      orderByColumn: "7",
      orderNo: POOrderID,
      itemNo: null,
      purchaseNo: null,
    };
    const test002 = await loadOrderDetail(param);
    const poRows = test002?.data?.rows;
    if (poRows.length > 1) {
      alert("请检查PO单大于1Rows的订单，需要重新仔细考虑PO多PI运费质检逻辑");
    }
    return test002?.data?.rows[0];
  }

  function trimTitle(title) {
    let curTitle =
      (title || "")
        .trim()
        .replace("&#39;", "'")
        .replace(/,/g, "，")
        .replace(/\n/g, " ") || "";
    curTitle = curTitle.replaceAll("&amp;", "&");
    return replacexxChart(special_charts, curTitle);
  }
  /**
   *
   * @param {*} wdSubOrder
   * @param {*} pdSubOrder
   * @returns
   */
  function checkSKUOK(wdSubOrder, pdSubOrder) {
    let isSKUOK = false;
    let cuase = "";
    const wdSKU = wdSubOrder.item_sku_title;
    let wdSKUs = [];
    if (wdSKU) {
      wdSKUs = wdSKU.split(";");
    }
    const curMatchSKUs = wdSKUs.filter((wdSKUItem) => {
      // [下单]的SKU是否包含相关SKU
      const isTrackSKUOK =
        pdSubOrder.trackListAttribute.indexOf(`:${wdSKUItem};`) !== -1 ||
        pdSubOrder.trackListAttribute.indexOf(`:${wdSKUItem}=`) !== -1;
      const zhijianTrack = pdSubOrder.trackList.find(
        (trackItem) => trackItem.content.indexOf("质检") !== -1
      );
      const zhijianContent = trimTitle(
        getHtmlPlainText(zhijianTrack?.content || "")
      );
      // TO质检中是否包含相关SKU,
      const isToZHiJianOK = zhijianContent.indexOf(`:${wdSKUItem};`) !== -1;
      if (isToZHiJianOK) {
        cuase = "TO质检中包含SKU并且已经匹配，人工核实下";
      }
      return isTrackSKUOK || isToZHiJianOK;
    });
    console.log("curMatchSKUs->", curMatchSKUs);
    if (curMatchSKUs.length === wdSKUs.length) {
      isSKUOK = true;
    } else {
      isSKUOK = false;
    }
    return {
      isSKUOK,
      cuase,
    };
  }
  function similar(s, t, f) {
    if (!s || !t) {
      return 0;
    }
    var l = s.length > t.length ? s.length : t.length;
    var n = s.length;
    var m = t.length;
    var d = [];
    f = f || 3;
    var min = function (a, b, c) {
      return a < b ? (a < c ? a : c) : b < c ? b : c;
    };
    var i, j, si, tj, cost;
    if (n === 0) return m;
    if (m === 0) return n;
    for (i = 0; i <= n; i++) {
      d[i] = [];
      d[i][0] = i;
    }
    for (j = 0; j <= m; j++) {
      d[0][j] = j;
    }
    for (i = 1; i <= n; i++) {
      si = s.charAt(i - 1);
      for (j = 1; j <= m; j++) {
        tj = t.charAt(j - 1);
        if (si === tj) {
          cost = 0;
        } else {
          cost = 1;
        }
        d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      }
    }
    let res = 1 - d[n][m] / l;
    return res.toFixed(f);
  }
  /**
   * 根据微店子订单查找 名字相同并且 SKU 属性相同 的PD子订单,
   * 理论上是可以多对多的， 但真实采购中 应该是wd1: pd多的， 因为PO单多时，会合并下单，
   * 如：
   * https://admin.pandabuy.com/order/search?purchaseNo=820970714994581
   * https://weidian.com/user/order-new/detail.php?oid=820970714994581
   *
   * @param {*} wdSubOrder 微店子订单
   * @param {*} pdItems 交易号下的PD所有订单
   */
  function _getPDSubOrderByWDSubOrder(wdSubOrder, pdItems) {
    let pdSubOrderObj;
    let success = true; // 是否能够成功获取
    let errorCause = ""; // 如果没有找到匹配的，发现了错误的原因，则需要上报
    // Step1 检查名字完全一致的
    let pdSubOrders = pdItems.filter((pdItem) => {
      // TODO 要检查一下名字是否准确
      const pdName = trimTitle(pdItem.goodsName);
      const wdName = trimTitle(wdSubOrder.item_title);
      // 【TODO 可以用照片的一致性来代替名字】
      // ; if (pdName.indexOf(wdName) !== -1) {
      //     return true;
      // };
      if (pdName === wdName) {
      } else {
        const sim = similar(pdName, wdName);
        console.log("pdname..", sim, `PD->${pdName}|||WD->${wdName}`);
      }
      return pdName === wdName;
    });
    const simPDItems = []; // 相似的pdItems
    // Step2 如果没有找到完全匹配的， 则找相似度比较高的那个
    if (pdSubOrders.length === 0) {
      pdSubOrders = pdItems.filter((pdItem) => {
        const pdName = trimTitle(pdItem.goodsName);
        const wdName = trimTitle(wdSubOrder.item_title);
        if (pdName !== wdName) {
          const sim = similar(pdName, wdName);
          const isSim = Number.parseFloat(sim) > 0.6;
          if (isSim) {
            simPDItems.push({ sim, pdItem });
          }
          return isSim;
        }
      });
    }
    const simTPItems = [];
    // Step3 如果没有找到相似度比较高的,进行图片对题
    if (pdSubOrders.length === 0) {
      console.log("33333333333333");
      pdSubOrders = pdItems.filter((pdItem) => {
        const pdName = trimTitle(pdItem.goodsImg);
        const wdName = trimTitle(wdSubOrder.img_head);
        const sim = similar(pdName, wdName);
        const isSim = Number.parseFloat(sim) > 0.7;
        console.log("图片路径相似度" + sim);
        if (wdName.indexOf(pdName) === 0) {
          simTPItems.push({ sim, pdItem });
          return true;
        }
        if (isSim) {
          simTPItems.push({ sim, pdItem });
        }
        return isSim;
      });
    }
    // 如果相同名字的只有1个，则直接返回
    // ; if (pdSubOrders.length === 1) {
    //     pdSubOrderObj = pdSubOrders[0]
    // };
    // 如果相同名字的有多个，则判断SKU属性完全一直的
    // ; if (pdSubOrders.length > 1) {
    const wdSKU = wdSubOrder.item_sku_title;
    let wdSKUs = [];
    if (wdSKU) {
      wdSKUs = wdSKU.split(";");
    }
    // 查找 完全匹配 名字和wdSKU PD子订单 的总数量
    let match_Name_SKU_PDSubOrders_nums = 0;
    // 查找 完全匹配 名字和wdSKU 的那个 PD子订单
    const match_Name_SKU_PDSubOrders = pdSubOrders.filter(
      (pdSubOrder, index) => {
        const res = checkSKUOK(wdSubOrder, pdSubOrder);
        const { isSKUOK, cuase } = res;
        errorCause = cuase;
        if (simPDItems.length > 0) {
          errorCause += `名字相似度${simPDItems[index].sim}：【WD】:${trimTitle(
            wdSubOrder.item_title
          )}，【PD】${trimTitle(pdSubOrder.goodsName)}`;
        }
        if (simTPItems.length > 0) {
          errorCause += `图片相同,名字不同：【WD】:${trimTitle(
            wdSubOrder.item_title
          )}，【PD】${trimTitle(pdSubOrder.goodsName)}`;
        }
        return isSKUOK;
        // const curMatchSKUs = wdSKUs.filter(wdSKUItem => {
        //     // [下单]的SKU是否包含相关SKU
        //     const isTrackSKUOK = pdSubOrder.trackListAttribute.indexOf(`:${wdSKUItem};`) !== -1;
        //     const zhijianTrack = pdSubOrder.trackList.find(trackItem => trackItem.content.indexOf('质检') !== -1);
        //     const zhijianContent = trimTitle(getHtmlPlainText(zhijianTrack?.content || ''))
        //     // TO质检中是否包含相关SKU,
        //     const isToZHiJianOK = zhijianContent.indexOf(`:${wdSKUItem};`) !== -1;
        //     if (isToZHiJianOK) {
        //         errorCause = 'TO质检中包含SKU并且已经匹配，人工核实下'
        //     }
        //     return isTrackSKUOK || isToZHiJianOK
        // });
        // ; console.log('curMatchSKUs->', curMatchSKUs);
        // ; if (curMatchSKUs.length === wdSKUs.length) {
        //     if (testff !== true) {
        //         console.log('fffffffffffffffff');
        //     }
        //     return true;
        // };
        // if (testff !== false) {
        //     console.log('fffffffffffffffff');
        // }
        // return false;
      }
    );
    match_Name_SKU_PDSubOrders.forEach((item) => {
      match_Name_SKU_PDSubOrders_nums += item.nums;
    });
    if (match_Name_SKU_PDSubOrders.length === 0) {
      // 如果没有找到对应SKU和名称的子订单泽返回空数组
      success = false;
      errorCause =
        `没找到完全和微店匹配的名称 SKU， 【WD】:${trimTitle(
          wdSubOrder.item_title
        )} [SKU]:${wdSubOrder.item_sku_title || ""} ` +
        (pdItems.length === 1 ? `【PD】${pdItems[0].trackListAttribute}` : "");
    } else if (match_Name_SKU_PDSubOrders.length === 1) {
      // pdSubOrderObj = match_Name_SKU_PDSubOrders[0]
      if (match_Name_SKU_PDSubOrders_nums === wdSubOrder.quantity) {
        pdSubOrderObj = match_Name_SKU_PDSubOrders[0];
      } else {
        console.error(
          "新检测出的异常数量单子:" +
            `购买数量不匹配，WD:【${wdSubOrder.item_title} ${wdSubOrder.item_sku_title} - ${wdSubOrder.quantity} 个】 PD数量:${match_Name_SKU_PDSubOrders_nums}` +
            pdItems[0]?.purchaseNo
        );
        success = false;
        errorCause = `购买数量不匹配，WD:【${wdSubOrder.item_title} ${wdSubOrder.item_sku_title} - ${wdSubOrder.quantity} 个】 PD数量:${match_Name_SKU_PDSubOrders_nums}`;
      }
    } else {
      console.log(
        "_getPDSubOrderByWDSubOrder--> 完全匹配 名字和wdSKU 的那个 PD子订单 不等于1, 应该是PO合并下单的情况"
      );
      // 如果微店子单的数量刚好和 PD 名字SKU完全的单子匹配时，则返回其中一个即可  （即为）
      if (match_Name_SKU_PDSubOrders_nums === wdSubOrder.quantity) {
        pdSubOrderObj = match_Name_SKU_PDSubOrders[0];
      } else {
        success = false;
        errorCause = `购买数量不匹配，WD:【${wdSubOrder.item_title} ${wdSubOrder.item_sku_title} - ${wdSubOrder.quantity} 个】 PD数量:${match_Name_SKU_PDSubOrders_nums}`;
      }
    }
    // };
    // return pdSubOrders;
    return {
      success,
      pdSubOrder: pdSubOrderObj,
      errorCause,
    };
  }
  // TODO 需要重新检查质检的逻辑 isWDSKU_IN_PDSKU 检查这个属性
  function checkSKU(wdItem, pdItems) {
    let isSKUOK = false;
    let isSKUSubOrdersOK = []; // 子订单skuok
    let hasBuTuiFlag = false; // 是否有“不退”标记
    let cause = "";
    let skuSubOrdersCause = []; // 所有没检测到没有成功的原因
    let skuSubWDOrderItems = []; // 微店有问题的自订单
    const wdSubOrders = wdItem.sub_orders;
    if (wdItem.order_id == "821443466442645") {
      console.log(`821443466442645			----  `);
    }
    wdSubOrders.forEach((wdSubOrder) => {
      if (wdSubOrder.item_id == "5462036736") {
        console.log(`5462036736----`);
      }
      const pdSubOrderRes = _getPDSubOrderByWDSubOrder(wdSubOrder, pdItems);
      const { success, pdSubOrder, errorCause } = pdSubOrderRes;
      // 如果对比SKU没有对比成功则， 则直接报错
      if (!success) {
        skuSubOrdersCause.push(errorCause);
        skuSubWDOrderItems.push(wdSubOrder);
        return;
      }
      // 如果 success没有失败，但有特殊通知的信息，可以通过errorCause透出
      if (errorCause) {
        skuSubOrdersCause.push(errorCause);
      }
      const wdSKU = wdSubOrder.item_sku_title;
      const pdSKU = (pdSubOrder || {}).trackListAttribute || "";
      let wdSKUs = [];
      if (wdSKU) {
        wdSKUs = wdSKU && wdSKU.split(";");
        if (wdSKU && wdSKU.indexOf(";") === -1) {
          wdSKUs = [wdSKU];
        }
      }

      // TODO TO质检需要排除

      const wdSKUPassedNum =
        wdSKUs &&
        wdSKUs
          .map((item) => {
            const a1 = pdSKU.indexOf(`:${item};`) !== -1;

            const a2 = pdSKU.indexOf(`:${item}=`) !== -1;

            return a1 || a2;
          })
          .filter((index) => index !== -1).length;

      // 微店里边的型号是否都在PD中

      const isWDSKU_IN_PDSKU = wdSKUPassedNum === wdSKUs.length;

      // 如果是false

      // if (pdSubOrder === false) {

      //     isSKUOK = false;

      //     cause = '没找到完全和微店匹配的名称 SKU, [商品]:' + wdSubOrder.item_sku_title + ' [SKU]:' + wdSubOrder.item_sku_title

      // }

      if (Array.isArray(pdSubOrder) && pdSubOrder.length > 1) {
        // TODO 重新检测逻辑， 需要人工检查的内容比较多, 多个PO 下的可以忽略

        const orderNos = pdSubOrder.map((subOrderItem) => subOrderItem.orderNo);

        const PO_length = Array.from(new Set(orderNos));

        // 如果所有的相同SKU的订单  是同一个人下边的，可以人工检查下， 如果是不同人下边的可以忽略,

        // 并且判断微店整体下单的数量和pdSubOrder的数量是否一致

        if (PO_length !== pdSubOrder.length) {
          isSKUOK = false;

          cause = "检测到存在多个名字相同并且SKU属性相同的商品，需要人工检查";
        }
      }

      if (!pdSubOrder || pdSubOrder.length === 0) {
        // const _cause = `检测到少采购内容：该订单中微店产品名【${wdSubOrder.item_title}】sku:${wdSubOrder.item_sku_title};该订单中所有panda商品名称:【${pdItems.map(item => item.goodsName).join('___;___')}】`;

        const _cause =
          pdItems.length === 0
            ? "多下单"
            : `检测不到完全匹配WD商品名的PD商品，【WD】：${trimTitle(
                wdSubOrder.item_title
              )} ${
                pdItems.length === 1
                  ? "【PD】:" + trimTitle(pdItems[0]?.goodsName)
                  : ""
              }】`;

        console.error(_cause);
        cause = _cause;
      } else if (!wdSKU && pdSKU === "[下单]:") {
        isSKUOK = true;

        // const _cause = `检测到WD和PD无SKU属性(需人工核实，存在的正常情况)，订单:${wdItem.order_id}商品ID:${wdSubOrder.item_id}`;

        // console.error(_cause)

        cause = `无SKU，可以忽略`;

        isSKUSubOrdersOK.push(isSKUOK);

        // } else ;if (pdSubOrder.trackListAttribute.indexOf(`:${wdSKU};`) !== -1) {

        //
      } else if (isWDSKU_IN_PDSKU) {
        // 微店里边的型号是否都在PD中

        isSKUOK = true;

        isSKUSubOrdersOK.push(isSKUOK);

        // console.error(`检测 订单 成功:${wdItem.order_id}, wd:${wdSubOrder.item_title} sku: ${wdSKU}`)
      } else {
        const _cause = `检测订单SKU失败(请检查: 跟单聊天内容):【WD】:${wdSKU};【PD】:${pdSubOrder.trackListAttribute}`;

        console.error(_cause);
        cause = _cause;
      }
    });

    const isSubOrdersAllOK = isSKUSubOrdersOK.length === wdSubOrders.length;

    console.log("isSubOrdersAllOK->", isSubOrdersAllOK, wdItem.order_id);

    let causeStr = trimTitle(cause) + ";" + skuSubOrdersCause.join(";");

    if (isSubOrdersAllOK && causeStr.length < 3) {
      const orderNos = pdItems.map((item) => item.orderNo);

      if ([...new Set(orderNos)].length > 1) {
        causeStr = "多PO单，未见异常，可忽略";
      } else if (orderNos.length > 1) {
        causeStr = "单个PO存在叠买，未见异常，可忽略";
      }
    }

    return {
      isSKUOK: isSubOrdersAllOK,

      cause: trimTitle(causeStr),
    };
  }

  function replacexxChart(charts, str) {
    let newStr = str;

    charts.forEach((chart) => {
      newStr = newStr.replaceAll(chart, "");
    });

    return newStr;
  }

  /**
    
     * 检查物流费用
    
     */

  function checkTotalPostage(wdItem, pdItems) {
    const pdPostage = pdItems.map((item) => item.totalPostage).sum();

    return parseFloat(wdItem.express_price) < pdPostage;
  }

  /**
    
     * 检查总数量
    
     */

  function checkTotalItemCount(wdItem, pdItems) {}

  function parseFloatFix(num, fix) {
    return parseFloat(num.toFixed(fix || 2));
  }

  /**
    
     * 检查总价格
    
     */

  function checkTotalItemPrice(wdItem, pdItems) {
    // sub_orders

    const checkRes = [];

    pd_items_array.forEach((pd_item_suborders, pdindex) => {
      // 当前交易号PD总价

      let curPurchaseNoTotalPrice_PD = 0;

      let curPurchaseNoTotalPrice_PD_1 = 0;

      let curPurchaseNoTotalPrice_PD_2 = 0;

      let orderNos = pd_item_suborders.map((item) => item.orderNo);

      orderNos = [...new Set(orderNos)];

      orderNos.forEach((orderNo) => {
        let item = pd_item_suborders.findLast(
          (subItem) => subItem.orderNo === orderNo
        );

        // curPurchaseNoTotalPrice_PD += item.goodsAmountTotal

        // curPurchaseNoTotalPrice_PD += (item._goodsAmount + item._goodsFilAmount) * item.nums

        curPurchaseNoTotalPrice_PD += item._goodsAmount + item._goodsFilAmount;
      });

      pd_item_suborders.forEach((item) => {
        // let item = pd_item_suborders.findLast(subItem => subItem.orderNo === orderNo);

        curPurchaseNoTotalPrice_PD_1 += item.goodsAmountTotal;

        curPurchaseNoTotalPrice_PD_2 +=
          (item._goodsAmount + item._goodsFilAmount) * item.nums;
      });

      const curPurchaseNo = pd_item_suborders[0]?.purchaseNo;

      if (curPurchaseNo === "821471599859605") {
        console.log("821471599859605--->", curPurchaseNo);
      }

      if (!curPurchaseNo) {
        console.log("异常交易单curPurchaseNo--->", curPurchaseNo);
      } else {
        // 当前交易号WD总价

        let curPurchaseNoTotalPrice_WD = 0;

        const wd_subOrders = wd_items.find(
          (item) => item.order_id === curPurchaseNo
        );

        if (!wd_subOrders) {
          console.log("微店订单异常，请检查curPurchaseNo--->", curPurchaseNo);

          alert("微店订单异常，请检查curPurchaseNo:" + curPurchaseNo);

          checkRes.push({
            pd交易单总价: curPurchaseNoTotalPrice_PD,

            wd交易单总价: curPurchaseNoTotalPrice_WD,

            curPurchaseNoTotalPrice_PD_1,

            curPurchaseNoTotalPrice_PD_2,

            purchaseNo: curPurchaseNo,

            cause: `微店订单异常，请检查`,
          });
        }

        wd_subOrders?.sub_orders.forEach((item) => {
          curPurchaseNoTotalPrice_WD += parseFloat(item.price) * item.quantity;
        });

        let modified_total_price = parseFloat(
          wd_subOrders.modified_total_price || 0
        ); //活动修改后总价格

        let dingdanGaijian_price = 0;
        if (modified_total_price !== 0) {
          dingdanGaijian_price =
            modified_total_price -
            curPurchaseNoTotalPrice_WD -
            parseFloat(wd_subOrders.modified_express_price);
        }

        console.log(
          "质检总价格 " +
            `单号:${curPurchaseNo} ->PD总价:${curPurchaseNoTotalPrice_PD}<WD总价:${curPurchaseNoTotalPrice_WD}`
        );

        if (
          parseFloatFix(
            dingdanGaijian_price < 0
              ? curPurchaseNoTotalPrice_WD + dingdanGaijian_price
              : curPurchaseNoTotalPrice_WD,
            2
          ) > parseFloatFix(curPurchaseNoTotalPrice_PD, 2)
        ) {
          checkRes.push({
            isOK: false,

            purchaseNo: curPurchaseNo,

            pd交易单总价: curPurchaseNoTotalPrice_PD,

            wd交易单总价: curPurchaseNoTotalPrice_WD,

            订单改减: dingdanGaijian_price || "",

            curPurchaseNoTotalPrice_PD_1,

            curPurchaseNoTotalPrice_PD_2,

            cause: `采购贵了，PD总价:${curPurchaseNoTotalPrice_PD}<WD总价:${curPurchaseNoTotalPrice_WD}`,
          });
        } else {
          checkRes.push({
            isOK: true,

            purchaseNo: curPurchaseNo,

            pd交易单总价: curPurchaseNoTotalPrice_PD,

            wd交易单总价: curPurchaseNoTotalPrice_WD,

            订单改减: dingdanGaijian_price || "",

            curPurchaseNoTotalPrice_PD_1,

            curPurchaseNoTotalPrice_PD_2,

            cause: ``,
          });
        }
      }
    });

    return checkRes;
  }

  function getHtmlPlainText(html_str) {
    //提取字符串中的文字

    let re = new RegExp("<[^<>]+>", "g");

    let text = html_str.replace(re, "");

    //或

    //var text = html_str.replace(/<[^<>]+>/g, "");

    return text.replace(",", "，");
  }

  /**
    
     * 检查是否有备注信息
    
     */

  function checkHasBeiZhuFlag() {
    const checkRes = [];

    pd_items_array.forEach((pd_item_suborders) => {
      // 当前交易号PD总价

      pd_item_suborders.forEach((item) => {
        const curPurchaseNo = item.purchaseNo;

        const hasBeiZhuFlag =
          item.trackListAttribute.indexOf("备注尺码") !== -1 ||
          item.trackListAttribute.indexOf("需要备注") !== -1 ||
          item.trackListAttribute.indexOf("帮我选") !== -1 ||
          item.trackListAttribute.indexOf("M版") !== -1 ||
          item.trackListAttribute.indexOf("正常") !== -1;

        if (hasBeiZhuFlag) {
          console.log(
            "hasBeiZhuFlag--->",
            hasBeiZhuFlag,
            item.purchaseNo,
            item.trackListAttribute
          );

          const zhijianTrack = item.trackList.find(
            (trackItem) => trackItem.content.indexOf("质检") !== -1
          );

          checkRes.push({
            purchaseNo: curPurchaseNo,

            cause: `包含尺码备注信息 请人工检查，【${trimTitle(
              item.trackListAttribute
            )}】【${trimTitle(
              getHtmlPlainText(zhijianTrack?.content || "")
            )}】`,
            cause2: item.itemQcTipsContent,
          });
        }
      });
    });

    return checkRes;
  }

  function noRepeat(arr) {
    var newArr = [...new Set(arr)]; //利用了Set结构不能接收重复数据的特点

    return newArr;
  }

  /**
    
     * 检查是否有多人混合单子
    
     */

  function checkHasMultiPersonOrder() {
    const pd_items_keys = Object.keys(pd_items);

    const pd_items_array = pd_items_keys.map((key) => {
      return pd_items[key];
    });

    window.pd_items_array = pd_items_array;

    const repeatOrders = [];

    pd_items_array.forEach((pd_item_suborders, index) => {
      if (pd_item_suborders[0]?.purchaseNo == "821334081984405") {
        console.log("purchaseNo", pd_item_suborders[0]?.purchaseNo);
      }

      const orderNos = pd_item_suborders.map(
        (subOrderItem) => subOrderItem.orderNo
      );

      const orderNos_noRepeat = noRepeat(orderNos);

      //    找到 PO 订单号多个的单子，

      // 找到 微店和pd 中商品数量不一致的单子

      // 微店中商品的数量

      let wd_item_length = 0;

      if (!pd_item_suborders[0]) {
        console.log("fffffffffffffffffffff", index);
      }

      wd_items
        .filter((item) => item)
        .find((item) => item.order_id === pd_item_suborders[0]?.purchaseNo)
        ?.sub_orders?.forEach((sub_order_item) => {
          wd_item_length += sub_order_item.quantity;
        });

      // PD中商品的数量

      let pd_item_suborders_length = 0;

      pd_item_suborders.forEach((sub_order_item) => {
        pd_item_suborders_length += sub_order_item.nums;
      });

      if (pd_item_suborders_length !== wd_item_length) {
        // console.error('orderNos_noRepeat->',noRepeat(pd_item_suborders.map(item=>item.purchaseNo)), orderNos_noRepeat)

        console.error(
          `orderNos_noRepeat===> 微店数量:${wd_item_length}, PD数量:${pd_item_suborders_length}`,
          noRepeat(pd_item_suborders.map((item) => item.purchaseNo)),
          orderNos_noRepeat
        );

        const repeatOrderId = noRepeat(
          pd_item_suborders.map((item) => item.purchaseNo)
        )[0];

        repeatOrders.push({
          repeatOrderId,

          // cause: `微店数量:${wd_item_length},PD数量:${pd_item_suborders_length}`

          cause:
            "WD数量:" + wd_item_length + " PD数量:" + pd_item_suborders_length,
        });
      }
    });

    return repeatOrders;
  }

  /**
    
     * 检查 标识有 不退货的时候要有标记提示
    
     */

  function checkMingXianXiaciBuTuiTip() {
    const noAskIds = [];

    pd_items_array.forEach((pd_item_suborders) => {
      pd_item_suborders.forEach((subOrderItem) => {
        const hasBuTuiFlag = subOrderItem.goodsName.indexOf("不退") !== -1;

        if (hasBuTuiFlag) {
          if (!subOrderItem.trackCategory.includes(3)) {
            noAskIds.push(subOrderItem.purchaseNo);
          }
        }
      });
    });

    return noAskIds;
  }

  async function getAddress(id) {
    try {
      const _url = `https://weidian.com/user/order-new/detail.php?oid=${id}`;

      const response = await fetch(_url);

      const txt = await response.text();

      console.log("txt", txt.substr(txt.indexOf("收货地址"), 80));

      const address = txt.substr(txt.indexOf("收货地址"), 80);

      console.log("address->", address);

      return trimTitle(address);
    } catch (error) {
      return "";
    }
  }

  // 导出Excel  Start-----

  function jsonToExcel(data, head, name = "导出的文件名") {
    let str = head ? head + "\n" : "";
    data.forEach((item) => {
      for (let key in item) {
        str = `${str + item[key] + "\t"},`;
      }

      str += "\n";
    });

    const uri = "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(str);
    const link = document.createElement("a");
    link.href = uri;
    link.download = `${name + ".csv"}`;
    link.click();
  }

  async function checkPOPostage(pdItems, wdPrice) {
    var isPass = true;
    let causeStr = "";

    if (!pdItems || pdItems.length < 1) {
      return {
        isPass: false,

        causeStr: "多下单",
      };
    }

    const poOrderNos = pdItems.map((item) => item.orderNo);

    const poOrderNos_single = [...new Set(poOrderNos)];

    // 要检查的去重运费的PO商品

    const postabelItems = [];

    poOrderNos_single.forEach((orderNo) => {
      const curPostageItem = pdItems.findLast((i) => i.orderNo === orderNo);

      postabelItems.push(curPostageItem);
    });

    // 每个po的运费

    const poPostages = postabelItems.map((p) => p._totalPostage || p._postage);

    const allPostage = poPostages.reduce((a, b) => a + b);

    if (allPostage < wdPrice) {
      isPass = false;

      causeStr = "pd整体运费小于wd运费";
    }

    const lessItems = postabelItems.filter((p) => {
      (p._totalPostage || p._postage) < wdPrice;
    });

    const noPassPOItems = postabelItems.filter(
      (item) => item._postage < 1 && item._totalPostage < 1
    );

    if (lessItems.length > 0) {
      isPass = false;

      causeStr =
        lessItems.map((item) => item.orderNo).join("，") + "PO单运费少于WD运费";
    } else if (wdPrice === 0) {
      isPass = true;

      causeStr = "WD0运费";
    } else if (noPassPOItems.length > 0) {
      isPass = false;

      causeStr =
        noPassPOItems.map((poItem) => poItem.orderNo).join("，") +
        "未检查到运费";
    } else {
      isPass = true;

      causeStr =
        postabelItems.length > 1
          ? `${postabelItems.length}个PO叠买，已付运费(待验证)`
          : "";

      postabelItems.forEach(async (pItem) => {
        const curOrderNoNum = pdItems.filter(
          (i) => i.orderNo === pItem.orderNo
        ).length;
        const poPIsInfo = await getPiInfosByOrderId(pItem.orderNo);

        causeStr += `【${pItem.orderNo}下PI:${curOrderNoNum}-piNew--${
          poPIsInfo?.items?.length
        }，共:${pItem._totalPostage || pItem._postage}￥】`;
      });
    }

    return {
      isPass,

      causeStr,

      minus: allPostage - wdPrice,
    };
  }

  async function beginCheck() {
    Array.prototype.sum = function () {
      var sum = 0;

      for (var i = 0; i < this.length; i++) {
        sum += this[i];
      }

      return sum;
    };

    const repeatOrders = checkHasMultiPersonOrder();

    const noAskIds = checkMingXianXiaciBuTuiTip();

    const totalPriceRes = checkTotalItemPrice();

    const hasBeizhuRes = checkHasBeiZhuFlag();

    const totalPriceResNoPassPurchaseNos = totalPriceRes
      .filter((item) => !item.isOK)
      .map((item) => item.purchaseNo);

    const hasBeizhuResNoPassPurchaseNos = hasBeizhuRes.map(
      (item) => item.purchaseNo
    );

    let resData = await wd_items.map(async (item) => {
      const pdItems = pd_items[`pdid_${item.order_id}`] || [];

      let skuRes = checkSKU(item, pdItems);

      // ;console.log('checkSKU->', skuRes);

      if (skuRes.cause?.indexOf("多") !== -1) {
        console.log("多PO->", pdItems);
      }

      const pdPostage = pdItems.map((item) => item.totalPostage).sum();

      const isPostageOK = parseFloat(item.express_price) <= pdPostage;

      let res2 = isPostageOK;

      if (item.order_id == 821378929334524) {
        console.log("821378929334524	->");
      }

      let postageRes = await checkPOPostage(
        pdItems,
        parseFloat(item.express_price)
      );

      // const address = getAddress(item.order_id);

      const postageLiRun = pdPostage - parseFloat(item.express_price);

      // ;console.log('checkPostage->', res2, item.express_price, pdPostage, pdItems.length);

      const reapeatObj = repeatOrders.find(
        (rpItem) => rpItem.repeatOrderId === item.order_id
      );

      const totalPriceItem =
        totalPriceRes.find((rpItem) => rpItem.purchaseNo === item.order_id) ||
        {};

      const isTotalPriceNoPass = totalPriceResNoPassPurchaseNos.includes(
        item.order_id
      );

      const hasBeizhuPriceNoPass = hasBeizhuResNoPassPurchaseNos.includes(
        item.order_id
      );

      if (item.order_id === "820940821854101") {
        console.log("820940821854101=>", pdItems);
      }

      let isHasBTGFlag =
        !postageRes.isPass ||
        (!pdItems && pdItems.length > 0) ||
        !res2 ||
        isTotalPriceNoPass ||
        !skuRes.isSKUOK ||
        hasBeizhuPriceNoPass ||
        noAskIds.includes(item.order_id);

      let beizhuItem =
        (window.beizhuInfo || []).find(
          (bzItem) => bzItem.id === item.order_id
        ) || {};

      let curBeizhuInfo = beizhuItem.note || "";

      let address = beizhuItem.address || "";

      return {
        订单号: item.order_id,

        采购员: pdItems[0]?.caigouyuan || "",

        整体质检: isHasBTGFlag ? "不通过(人工核实)" : "通过",

        "质检多下单(待验证)": pdItems && pdItems.length > 0 ? "通过" : "不通过",

        质检运费: res2 && postageRes.isPass ? "通过" : "不通过",

        // '运费 空间': postageLiRun + postageRes.causeStr,

        "运费 空间": postageLiRun,

        "新运费 空间": postageRes.minus,

        "运费 备注": postageRes.causeStr,

        质检商品总数量: reapeatObj ? "下单异常" : "通过",

        "商品总数量 异常原因": reapeatObj ? reapeatObj.cause : "",

        质检商品总价格: isTotalPriceNoPass ? "不通过" : "通过",

        "总价格 不通过原因": isTotalPriceNoPass
          ? totalPriceRes.find(
              (nopassItem) => nopassItem.purchaseNo === item.order_id
            ).cause
          : "",

        wd总价: totalPriceItem.wd交易单总价,

        pd总价: totalPriceItem.pd交易单总价,

        订单改减: totalPriceItem.订单改减 || "",

        // 'pdZJ001': totalPriceItem.curPurchaseNoTotalPrice_PD_1,

        // 'pdZJ002': totalPriceItem.curPurchaseNoTotalPrice_PD_2,

        "质检 SKU": skuRes.isSKUOK
          ? skuRes.cause.indexOf("相似度") !== -1
            ? "通过（名险过）"
            : skuRes.cause.indexOf("图片") !== -1
            ? "通过（图险过）"
            : "通过"
          : "不通过",

        "SKU 不通过原因": skuRes.cause,

        "质检 包含备注尺码": hasBeizhuPriceNoPass
          ? "包含(需要采购员核对)"
          : "不包含",

        "备注尺码 222": hasBeizhuPriceNoPass
          ? hasBeizhuRes.find(
              (nopassItem) => nopassItem.purchaseNo === item.order_id
            ).cause2
          : "",
        "备注尺码 不通过原因": hasBeizhuPriceNoPass
          ? hasBeizhuRes.find(
              (nopassItem) => nopassItem.purchaseNo === item.order_id
            ).cause
          : "",

        "WD备注信息(待测试)": curBeizhuInfo,

        质检不退标记: noAskIds.includes(item.order_id) ? "不通过" : "通过",

        "收获地址(待测试)": address,

        微店链接: "https://i.weidian.com/order/detail.php?oid=" + item.order_id,

        panda链接:
          "https://admin.pandabuy.com/order/search?purchaseNo=" + item.order_id,

        采集时间: item.zdcjTime采集时间,
      };
    });

    Promise.all(resData)
      .then(function (datas) {
        console.log("ok");
        console.log("Contents: " + datas);
        console.log("resData---33f>", datas);
        jsonToExcel(datas, Object.keys(datas[0]));
      })
      .catch(function (reason) {
        console.log("出错了", reason);
      });

    setTimeout(() => {
      Promise.all(resData)
        .then(function (datas) {
          console.log("ok");
          console.log("Contents: " + datas);
          console.log("resData---33f>", datas);
          jsonToExcel(datas, Object.keys(datas[0]));
        })
        .catch(function (reason) {
          console.log("出错了", reason);
        });
    }, 20000);
    // jsonToExcel(resData, ['订单号', '质检 SKU', '质检 运费', '运费 空间', '微店链接', 'panda链接', '采集时间'])
    // console.log('resData---f>', resData);
    // jsonToExcel(resData, Object.keys(resData[0]))
  }

  beginCheck();
}

window.doExcute = doExcute;
