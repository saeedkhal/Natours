class apiFeatures {
  constructor(mongQueryArr, reqQueryObj) {
    this.mongQueryArr = mongQueryArr;
    this.reqQueryObj = reqQueryObj;
  }

  filtering() {
    /* 1) FILTERING */
    /* EXCULDE SOME ELEMNT FROM THE QUERY */
    let reqCopyOBJ = JSON.parse(JSON.stringify(this.reqQueryObj));
    // const reqQueryObj = { ...req.query };
    const excludedArray = ['sort', 'page', 'limit', 'fields'];
    excludedArray.forEach((el) => delete reqCopyOBJ[el]);

    /* 2) AVANCED FILTERING  FILTER  BY > = < */

    const reqCopyStr = JSON.stringify(reqCopyOBJ).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    reqCopyOBJ = JSON.parse(reqCopyStr);
    this.mongQueryArr = this.mongQueryArr.find(reqCopyOBJ);
    return this;
  }

  sorting() {
    /* 3) SORTING */
    if (this.reqQueryObj.sort) {
      const sortByStr = this.reqQueryObj.sort.replace(',', '');
      this.mongQueryArr = this.mongQueryArr.sort(sortByStr);
    } else {
      this.mongQueryArr = this.mongQueryArr.sort('-createdAt');
    }
    return this;
  }

  projection() {
    /* 4) LIMITING OR PROJECTION OR SELECT FIELDS*/
    if (this.reqQueryObj.fields) {
      const fields = this.reqQueryObj.fields.replace(',', ' ');
      this.mongQueryArr = this.mongQueryArr.select(fields);
    } else {
      this.mongQueryArr = this.mongQueryArr.select('-__V');
    }
    return this;
  }

  skipingAndlimiting() {
    /* 5) SKIPING AND LIMITING  */
    const page = this.reqQueryObj.page * 1 || 1;
    const limitNum = this.reqQueryObj.limit * 1 || 3; //  the number of result that will be display
    const skipNum = (page - 1) * limitNum; //the number of skiped document before disply the result
    this.mongQueryArr = this.mongQueryArr.skip(skipNum).limit(limitNum);
    return this;
  }
}
module.exports = apiFeatures;
