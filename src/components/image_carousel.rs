use yew::prelude::*;
use gloo::timers::callback::Interval;

#[function_component(ImageCarousel)]
pub fn image_carousel() -> Html {
    let index = use_state(|| 0);

    {
        let index = index.clone();
        use_effect_with_deps(move |_| {
            let interval = Interval::new(3000, move || {
                index.set((*index + 1) % IMAGES.len());
            });
            || drop(interval)
        }, ());
    }

    html! {
        <div class="carousel">
            <img src={IMAGES[*index]} class="carousel-image" />
        </div>
    }
}
