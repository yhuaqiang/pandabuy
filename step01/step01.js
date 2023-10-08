window.beginCJ = true;
localStorage.setItem('noPayOrders', JSON.stringify([]))
document.getElementsByClassName('tab_content')[0].getElementsByTagName('li')[1].click();
function jsonToExcel(data, head, name = '导出的文件名') {
    let str = head ? head + '\n' : ''; data.forEach(item => {
        for (let key in item) { str = `${str + item[key] + '\t'},` }
        str += '\n'
    });
    console.log(str)
    const uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    const link = document.createElement("a");
    link.href = uri;
    link.download = `${name + '.csv'}`;
    link.click();
}
setTimeout(() => {
    window.OrderCJTimer = setInterval(() => {
        const moreBtn = document.getElementsByClassName('more_span')[0];
        if (moreBtn) {
            moreBtn.click()
        } else {
            window.clearInterval(window.OrderCJTimer)
            const noPayOrders = JSON.parse(localStorage.getItem('noPayOrders'))
            const excelData = noPayOrders.filter(item => item).map(item => {
                return {
                    order_id: item.order_id,
                    wd_url: 'https://i.weidian.com/order/detail.php?oid=' + item.order_id,
                    panda_url: 'https://admin.pandabuy.com/order/search?purchaseNo=' + item.order_id,
                    cjTime: item.zdcjTime采集时间
                }
            })
            console.log('--------------------- 要开始喽~ ------------------------')
            console.log(excelData)
            jsonToExcel(excelData, ['订单号', '微店链接', 'panda链接', '采集时间'])
        }
    }, 1000)
}, 1000)