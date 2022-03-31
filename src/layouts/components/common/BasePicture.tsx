import React from 'react';

type Props = {
    pcImg: string;
    spImg: string;
    alt?: string;
    role?: string;
    width: number;
    height: number;
};

const BasePicture: React.VFC<Props> = (props) => {
    return (
        <picture>
            <source media="(max-width:768px)" srcSet={`assets/img/sp/${props.spImg}`} />
            <img decoding="async" src={`assets/img/pc/${props.pcImg}`} alt={props.alt} role={props.role} width={props.width} height={props.height} />
        </picture>
    );
};

export default BasePicture;
