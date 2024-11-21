import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('WelcomePage => UsersPage', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
      query(':leave', [animate('500ms ease-out', style({ transform: 'translateX(-100%)' }))], { optional: true }),
      query(':enter', [style({ transform: 'translateX(100%)' }), animate('500ms ease-out', style({ transform: 'translateX(0%)' }))], { optional: true })
    ])
  ]),
  transition('UsersPage => WelcomePage', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
      query(':leave', [animate('500ms ease-out', style({ transform: 'translateX(100%)' }))], { optional: true }),
      query(':enter', [style({ transform: 'translateX(-100%)' }), animate('500ms ease-out', style({ transform: 'translateX(0%)' }))], { optional: true })
    ])
  ]),
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
    group([
      query(':leave', [
        animate('500ms ease-in', style({ 
          opacity: 0, 
          transform: 'translateY(-100%)' 
        }))
      ], { optional: true }),
  
      query(':enter', [
        style({ 
          transform: 'translateY(100%)', 
          opacity: 0 
        }),
        animate('500ms ease-in', style({ 
          opacity: 1, 
          transform: 'translateY(0%)' 
        }))
      ], { optional: true })
    ])
  ])
  
]);
