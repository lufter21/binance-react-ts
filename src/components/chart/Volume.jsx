import React, { useEffect, useRef } from 'react';
import css from './Volume.module.css';

function Chart(canvInEl, isShadow) {
   this.isShadow = isShadow;
   this.maxVol = 0;
   this.canvElWidth = 0;
   this.candleWidth = 9;
   this.candlesCount = 0;

   this.canvInEl = canvInEl;

   this.canvEl = document.createElement('canvas');

   this.canvEl.classList.add((isShadow) ? css.shadowCanvas : css.canvas);

   this.canvInEl.appendChild(this.canvEl);

   this.canvEl.height = this.canvEl.offsetHeight;

   this.ctx = this.canvEl.getContext('2d');
}

Chart.prototype.drawVolume = function (i, vol) {
   const pix = this.canvEl.height / this.maxVol,
      barX = i * this.candleWidth + this.candleWidth * i,
      barH = Math.ceil(vol * pix * -1);

   if (!i) {
      this.ctx.clearRect(0, 0, this.canvEl.width, this.canvEl.height);
   }

   this.ctx.fillStyle = '#888888';
   this.ctx.fillRect(barX, this.canvEl.height, this.candleWidth, barH);
}

Chart.prototype.draw = function (candles, reset) {
   if (reset) {
		this.candlesCount = 0;
		this.maxVol = 0;
   }
   
   this.candlesCount = candles.length;

   candles.forEach(obj => {
      if (obj.volume > this.maxVol || !this.maxVol) {
         this.maxVol = obj.volume;
      }
   });

   const canvElW = candles.length * this.candleWidth + this.candleWidth * candles.length;

   this.canvEl.width = canvElW;
   this.canvEl.style.width = canvElW + 'px';

   candles.forEach((obj, i) => {
      this.drawVolume(i, obj.volume);
   });
}

let chart = null,
   canvWrapInRef,
   isInitialMount;

// exported component
function Volume(props) {
   isInitialMount = useRef(true);
   canvWrapInRef = React.createRef();

   useEffect(function () {
      if (isInitialMount.current) {
         isInitialMount.current = false;

         chart = new Chart(canvWrapInRef.current);
      }

      chart.draw(props.candles, props.reset);
   });

   return (
      <div className={css.canvasContainer}>
         <div className={css.canvasWrap}>
            <div ref={canvWrapInRef} className={css.canvasWrap__inner + ' move-axis-x'}></div>
         </div>
      </div>
   );
}

export default Volume;