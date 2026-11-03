use yew::prelude::*;

#[derive(Properties, PartialEq, Clone)]
pub struct PhotoProps {
    pub url: String,
    pub preview: String,
    pub alt: String,
}

#[function_component(PhotoCard)]
fn photo_card(props: &PhotoProps) -> Html {
    html! {
        <a href={props.url.clone()} target="_blank" class="photo-card">
            <img src={props.preview.clone()} alt={props.alt.clone()} class="photo-img" />
        </a>
    }
}

#[function_component(Gallery)]
pub fn gallery() -> Html {
    let photos = vec![
        PhotoProps {
            url: "https://www.instagram.com/p/DNyCnjM0Nwv/".to_string(),
            preview: "/gallery/preview1.jpg".to_string(),
            alt: "Картина 1".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/izo_studia_zhodino/p/DNsaTHzULTI/".to_string(),
            preview: "/gallery/preview2.jpg".to_string(),
            alt: "Картина 2".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/izo_studia_zhodino/p/DN5R6IrCN51/".to_string(),
            preview: "/gallery/preview3.jpg".to_string(),
            alt: "Картина 3".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DNU7DyIonZe/".to_string(),
            preview: "/gallery/preview4.jpg".to_string(),
            alt: "Картина 4".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DNTVXOOIzdL/".to_string(),
            preview: "/gallery/preview5.jpg".to_string(),
            alt: "Картина 5".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DNTkhcNOnzM/".to_string(),
            preview: "/gallery/preview6.jpg".to_string(),
            alt: "Картина 6".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DNlcNAOoDTY/".to_string(),
            preview: "/gallery/preview7.jpg".to_string(),
            alt: "Картина 7".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DN5Rf2lCCk6/".to_string(),
            preview: "/gallery/preview8.jpg".to_string(),
            alt: "Картина 8".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DRm_EplCKyh/".to_string(),
            preview: "/gallery/preview9.jpg".to_string(),
            alt: "Картина 9".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DRPZ5LEiEx5/".to_string(),
            preview: "/gallery/preview10.webp".to_string(),
            alt: "Картина 10".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DRhE-vJCA_7/".to_string(),
            preview: "/gallery/preview11.webp".to_string(),
            alt: "Картина 11".to_string(),
        },
        PhotoProps {
            url: "https://www.instagram.com/p/DRPZsgXiDJT/".to_string(),
            preview: "/gallery/preview12.webp".to_string(),
            alt: "Картина 12".to_string(),
        },
    ];

    html! {
        <div class="gallery">
            { for photos.iter().map(|photo| html! { <PhotoCard ..photo.clone() /> }) }
        </div>
    }
}
