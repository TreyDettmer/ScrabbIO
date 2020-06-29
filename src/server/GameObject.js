//base game object is clickable and has a x,y,width,height

class GameObject {

  constructor(xPosition = 0,yPosition = 0,width=1,height=1,bSelected=false)
  {

    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.width = width;
    this.height = height;
    this.bSelected = bSelected;
  }

  set(xPosition,yPosition,width,height)
  {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.width = width;
    this.height = height;
  }

  contains(position) {

      return this.xPosition <= position[0] && position[0] <= this.xPosition + this.width &&
             this.yPosition <= position[1] && position[1] <= this.yPosition + this.height;
  }

}
module.exports = GameObject;
