import { Directive, ElementRef, Input, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlightSelected]',
  standalone: true
})
export class HighlightSelectedDirective implements OnChanges {
  @Input('appHighlightSelected') isSelected: boolean = false;
  @Input() highlightColor: string = '#c0c8e0';
  @Input() borderColor: string = '#8492c4';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isSelected']) {
      if (this.isSelected) {
        this.renderer.setStyle(this.el.nativeElement, 'background-color', this.highlightColor);
        this.renderer.setStyle(this.el.nativeElement, 'border-color', this.borderColor);
      } else {
        this.renderer.removeStyle(this.el.nativeElement, 'background-color');
        this.renderer.removeStyle(this.el.nativeElement, 'border-color');
      }
    }
  }
}
