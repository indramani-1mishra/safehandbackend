function getdate() {
    const todayDate = {};
    const date = new Date();

    // console.log("Full:", date.toLocaleString());

    todayDate.today = String(date.getDate()).padStart(2, "0");
    todayDate.todayMonth = String(date.getMonth() + 1).padStart(2, "0");
    todayDate.todayYear = date.getFullYear();

    return Object.values(todayDate).join('/');;
}

module.exports = getdate;
