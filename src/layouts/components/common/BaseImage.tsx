import React from 'react';

type Props = {
    img: string;
    alt?: string;
    role?: string;
    width: number;
    height: number;
};

const BaseImage: React.VFC<Props> = (props) => {
    return <img decoding="async" src={`/img/${props.img}`} alt={props.alt} role={props.role} width={props.width} height={props.height} />;
};

export default BaseImage;
