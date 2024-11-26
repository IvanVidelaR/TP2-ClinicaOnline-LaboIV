import { Directive, ElementRef, Renderer2, Input, OnInit, HostListener } from '@angular/core';

@Directive({
  selector: '[appShadowEffect]',
  standalone: true
})
export class ShadowEffectDirective implements OnInit {
  @Input() hoverColor: string = '#000000';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.applyStyles();
  }

  private applyStyles() {
    const button = this.el.nativeElement;

    this.renderer.setStyle(button, 'transition', 'transform 0.2s ease, box-shadow 0.2s ease');
    this.renderer.setStyle(button, 'cursor', 'pointer');
  }

  @HostListener('mouseenter') onMouseEnter() {
    const button = this.el.nativeElement;
    this.renderer.setStyle(button, 'transform', 'translateY(-5px)');
    this.renderer.setStyle(button, 'box-shadow', `0 5px 25px rgba(${this.hexToRgb(this.hoverColor)}, 0.5)`);
  }

  @HostListener('mouseleave') onMouseLeave() {
    const button = this.el.nativeElement;
    this.renderer.removeStyle(button, 'transform');
    this.renderer.removeStyle(button, 'box-shadow');
  }

  private hexToRgb(hex: string) {
    let r: number = 0, g: number = 0, b: number = 0;

    hex = hex.replace(/^#/, '');
    if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `${r},${g},${b}`;
  }
}
