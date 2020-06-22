
export function MyRect (x, y, w, h,innerObject = null) {

    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    this.contains = function (x, y) {
        return this.x <= x && x <= this.x + this.width &&
               this.y <= y && y <= this.y + this.height;
    }

    this.draw = function (ctx,outline = false) {
        if (outline)
        {
          ctx.strokeRect(this.x, this.y, this.width, this.height)
        }
        else
        {
          ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }

    this.drawOffset = function (ctx, xOffset,yOffset,outline = false)
    {
      if (outline)
      {
        ctx.strokeRect(this.x + xOffset, this.y + yOffset, this.width, this.height)
      }
      else
      {
        ctx.fillRect(this.x + xOffset, this.y + yOffset, this.width, this.height)
      }
    }

    this.getX = function () {
      return this.x;
    }
    this.getY = function () {
      return this.y;
    }
}
