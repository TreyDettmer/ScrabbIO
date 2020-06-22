class GameObject {

  constructor()
  {
    this.xPosition = 0;
    this.yPosition = 0;
    this.width = 1;
    this.height = 1;
  }

  set(xPosition,yPosition,width,height)
  {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.width = width;
    this.height = height;
  }

}
module.exports = GameObject;
