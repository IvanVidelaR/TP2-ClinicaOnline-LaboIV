import { Directive, ElementRef, Input, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input() tooltipMessage: string = '';
  private tooltip: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.tooltip = this.renderer.createElement('span');
    this.renderer.appendChild(this.tooltip, this.renderer.createText(this.tooltipMessage));
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'background-color', 'rgba(0, 0, 0, 0.7)');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '5px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltip, 'z-index', '1000'); 
    this.renderer.setStyle(this.tooltip, 'pointer-events', 'none'); 

    this.renderer.appendChild(document.body, this.tooltip);


    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipHeight = this.tooltip?.offsetHeight || 0;
    const tooltipWidth = this.tooltip?.offsetWidth || 0;
    
    const top = rect.top + window.scrollY - tooltipHeight - 5;
    const left = rect.left - window.scrollX + (rect.width / 2) - (tooltipWidth / 2);

    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;

    }
  }
}
