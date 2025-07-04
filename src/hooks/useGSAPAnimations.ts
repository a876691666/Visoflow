import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

export function useGSAPAnimations() {
  const timeline = ref<gsap.core.Timeline | null>(null);
  const isAnimating = ref(false);

  onMounted(() => {
    // Initialize GSAP timeline
    timeline.value = gsap.timeline({ paused: true });
  });

  onUnmounted(() => {
    // Clean up animations
    if (timeline.value) {
      timeline.value.kill();
    }
  });

  // Fade in animation
  const fadeIn = (element: HTMLElement, duration = 0.3) => {
    return gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration, ease: 'power2.out' }
    );
  };

  // Fade out animation
  const fadeOut = (element: HTMLElement, duration = 0.3) => {
    return gsap.to(element, {
      opacity: 0,
      y: -20,
      duration,
      ease: 'power2.in'
    });
  };

  // Scale animation
  const scaleIn = (element: HTMLElement, duration = 0.3) => {
    return gsap.fromTo(
      element,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration, ease: 'back.out(1.7)' }
    );
  };

  // Slide animation
  const slideIn = (
    element: HTMLElement,
    direction = 'left',
    duration = 0.3
  ) => {
    const fromProps: any = { opacity: 0 };
    const toProps: any = { opacity: 1, duration, ease: 'power2.out' };

    switch (direction) {
      case 'left':
        fromProps.x = -50;
        toProps.x = 0;
        break;
      case 'right':
        fromProps.x = 50;
        toProps.x = 0;
        break;
      case 'top':
        fromProps.y = -50;
        toProps.y = 0;
        break;
      case 'bottom':
        fromProps.y = 50;
        toProps.y = 0;
        break;
    }

    return gsap.fromTo(element, fromProps, toProps);
  };

  // Bounce animation
  const bounce = (element: HTMLElement) => {
    return gsap.to(element, {
      y: -10,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    });
  };

  // Shake animation
  const shake = (element: HTMLElement) => {
    return gsap.to(element, {
      x: -5,
      duration: 0.1,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 5
    });
  };

  // Pulse animation
  const pulse = (element: HTMLElement) => {
    return gsap.to(element, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    });
  };

  // Stagger animation for multiple elements
  const staggerIn = (
    elements: HTMLElement[],
    duration = 0.3,
    stagger = 0.1
  ) => {
    return gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power2.out',
        stagger
      }
    );
  };

  // Morphing animation (for SVG paths)
  const morphPath = (
    element: SVGPathElement,
    newPath: string,
    duration = 0.5
  ) => {
    return gsap.to(element, {
      morphSVG: newPath,
      duration,
      ease: 'power2.inOut'
    });
  };

  // Drag animation with momentum
  const createDragAnimation = (element: HTMLElement) => {
    let dragInstance: any = null;

    if (typeof window !== 'undefined' && (window as any).Draggable) {
      const Draggable = (window as any).Draggable;

      dragInstance = Draggable.create(element, {
        type: 'x,y',
        edgeResistance: 0.65,
        bounds: 'body',
        inertia: true,
        onDragStart() {
          gsap.to(element, { scale: 1.1, duration: 0.2 });
        },
        onDragEnd() {
          gsap.to(element, { scale: 1, duration: 0.2 });
        }
      });
    }

    return {
      destroy: () => {
        if (dragInstance && dragInstance[0]) {
          dragInstance[0].kill();
        }
      }
    };
  };

  // Chain multiple animations
  const chainAnimations = (animations: (() => gsap.core.Tween)[]) => {
    if (!timeline.value) return;

    timeline.value.clear();
    animations.forEach((animationFn) => {
      timeline.value!.add(animationFn());
    });

    return timeline.value.play();
  };

  // Set animation state
  const setAnimating = (state: boolean) => {
    isAnimating.value = state;
  };

  return {
    timeline,
    isAnimating,
    fadeIn,
    fadeOut,
    scaleIn,
    slideIn,
    bounce,
    shake,
    pulse,
    staggerIn,
    morphPath,
    createDragAnimation,
    chainAnimations,
    setAnimating
  };
}
