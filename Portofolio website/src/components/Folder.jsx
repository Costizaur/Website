import './Folder.css';

// A folder with up to three of its files peeking out of the top.
// Purely visual: whoever hosts it decides its width (--fw), what a click does,
// and when the flap opens and the papers fan out.
const Folder = ({ color = '#ffc53d', items = [] }) => {
    const papers = items.slice(0, 3);

    return (
        <span className="folder" data-papers={papers.length} style={{ '--folder': color }} aria-hidden="true">
            <span className="folder-back"></span>
            {papers.map((item, i) => (
                typeof item === 'string' && item.startsWith('#') ? (
                    <span key={i} className="folder-paper" style={{ background: item }}></span>
                ) : (
                    <img key={i} src={item} alt="" className="folder-paper" draggable="false" />
                )
            ))}
            <span className="folder-front"></span>
        </span>
    );
};

export default Folder;
