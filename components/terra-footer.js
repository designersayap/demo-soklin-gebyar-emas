import { useState } from 'react';
import Link from 'next/link';
import styles from "./terra-footer.module.css";
const DEFAULT_PLACEHOLDER_IMAGE = "https://space.lunaaar.site/assets-lunar/placeholder.svg";
import { componentDefaults } from "./data";
import { createUpdateHandler } from "./component-helpers";
import { getContainerClasses } from "./section-utils";


const openDialog = (id) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lunar:open-dialog', { detail: { id } }));
    
    // Runtime Fallback: If specific ID fails (e.g. timestamp from old data), try default dialogs
    if (id && id !== 'dialog-item-list' && id !== 'dialog-accordion') {
        window.dispatchEvent(new CustomEvent('lunar:open-dialog', { detail: { id: 'dialog-item-list' } }));
    }
  }
};

const showToast = (message, type = 'success') => {
  if (typeof window !== 'undefined') {
    // In exported files, we can use a simple alert as a fallback
    // or the user can implement their own toast listener
    alert(message);
  }
};

// Shim for BuilderText
const BuilderText = ({ tagName = 'p', content, className, style, children, id, sectionId, suffix, isVisible = true, tooltipIfTruncated }) => {
  if (!isVisible) return null;
  const Tag = tagName;
  const normalizedSectionId = (sectionId && typeof sectionId === 'string') ? sectionId.replace(/-+$/, '') : '';
  const effectiveSuffix = suffix || (className ? className.split(' ')[0] : tagName);
  let finalId = id || (normalizedSectionId ? normalizedSectionId + '-' + effectiveSuffix : undefined);
  finalId = finalId ? finalId.replace(/-+/g, '-') : undefined;

  const finalClassName = `builder-text ${className || ''} ${!content && !children ? 'empty-builder-text' : ''}`.trim();

  // Basic Truncation Tooltip Fallback
  const [isHovered, setIsHovered] = useState(false);
  const title = (tooltipIfTruncated && isHovered) ? content : undefined;

  if (content) {
    return (
      <Tag 
        id={finalId} 
        className={finalClassName} 
        style={style} 
        dangerouslySetInnerHTML={{ __html: content }} 
        title={title}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    );
  }
  return (
    <Tag 
      id={finalId} 
      className={finalClassName} 
      style={style}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Tag>
  );
};

// Shim for BuilderLink
const BuilderLink = ({ label, href, className, style, children, linkType, targetDialogId, id, sectionId, suffix, iconLeft, iconRight, justify, hideLabel, isVisible = true }) => {
  if (!isVisible) return null;
  const normalizedSectionId = (sectionId && typeof sectionId === 'string') ? sectionId.replace(/-+$/, '') : '';
  let finalId = id || (normalizedSectionId && suffix ? normalizedSectionId + '-' + suffix : undefined);
  finalId = finalId ? finalId.replace(/-+/g, '-') : undefined;
  
  const content = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: justify || 'center', width: '100%', height: '100%', gap: 'inherit' }}>
         {iconLeft && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{iconLeft}</span>}
         {!hideLabel && (
             <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: justify || 'center' }}>
                {label || children}
             </div>
         )}
         {iconRight && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{iconRight}</span>}
      </div>
  );

  if (linkType === 'dialog' && targetDialogId) {
    return (
      <a
        id={finalId}
        href="#"
        className={className}
        style={style}
        onClick={(e) => {
            e.preventDefault();
            openDialog(targetDialogId);
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <a
      id={finalId}
      href={href || '#'} 
      className={className} 
      style={style}
    >
      {content}
    </a>
  );
};

const BuilderImage = ({ src, mobileSrc, alt, className, style, mobileRatio, href, linkType, targetDialogId, id, sectionId, suffix, isPortrait, isVisible = true }) => {
  if (!isVisible) return null;
  const normalizedSectionId = (sectionId && typeof sectionId === 'string') ? sectionId.replace(/-+$/, '') : '';
  let finalId = id || (normalizedSectionId && suffix ? normalizedSectionId + '-' + suffix : undefined);
  finalId = finalId ? finalId.replace(/-+/g, '-') : undefined;
  const effectiveAlt = (!alt || alt === '#') && normalizedSectionId ? normalizedSectionId : (alt || '');
  let baseClassName = className || '';
  
  if (isPortrait === true || String(isPortrait) === 'true') {
    const portraitMap = {
        'imagePlaceholder-4-3': 'imagePlaceholder-3-4',
        'imagePlaceholder-16-9': 'imagePlaceholder-9-16',
        'imagePlaceholder-21-9': 'imagePlaceholder-9-21',
        'imagePlaceholder-5-4': 'imagePlaceholder-4-5'
    };
    Object.entries(portraitMap).forEach(([landscape, portrait]) => {
        baseClassName = baseClassName.replace(landscape, portrait);
    });
  }

  if (mobileRatio) {
     baseClassName += ` mobile-aspect-${mobileRatio}`;
  }
  
  const defaultStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const isVideoFile = (url) => url && typeof url === 'string' && url.match(/\.(mp4|webm|ogg|mov)$/i);
  const isYoutube = (url) => url && typeof url === 'string' && url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*$/);
  const isVimeo = (url) => url && typeof url === 'string' && url.match(/^(https?:\/\/)?(www\.)?(vimeo\.com)\/.*$/);

  const getYoutubeEmbedUrl = (url) => {
      if (!url) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const id = (match && match[2].length === 11) ? match[2] : null;
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0` : url;
  };

  const getVimeoEmbedUrl = (url) => {
      if (!url) return '';
      const regExp = /vimeo\.com\/(\d+)/;
      const match = url.match(regExp);
      const id = match ? match[1] : null;
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&muted=1&background=1` : url;
  };

  const placeholderSrc = "https://space.lunaaar.site/assets-lunar/placeholder.svg";
  const imageSrc = (src && src !== "") ? src : placeholderSrc;

  const isLink = href || (linkType === 'dialog' && targetDialogId);
  
  // If we have a link, we apply className and aspect-ratio to the <a> wrapper
  // and keep internal media at 100%/100%
  const mediaStyle = isLink ? { ...defaultStyle } : { ...defaultStyle, ...style };
  const mediaClass = isLink ? '' : baseClassName;

  let mediaContent;
  if (isYoutube(src)) {
      mediaContent = (
          <iframe
              id={!isLink ? finalId : undefined}
              src={getYoutubeEmbedUrl(src)}
              className={mediaClass}
              style={{ ...mediaStyle, border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="YouTube video"
          />
      );
  } else if (isVimeo(src)) {
      mediaContent = (
          <iframe
              id={!isLink ? finalId : undefined}
              src={getVimeoEmbedUrl(src)}
              className={mediaClass}
              style={{ ...mediaStyle, border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Vimeo video"
          />
      );
  } else if (isVideoFile(src)) {
      mediaContent = (
          <video
              id={!isLink ? finalId : undefined}
              className={mediaClass}
              style={mediaStyle}
              autoPlay
              loop
              muted
              playsInline
          >
              {mobileSrc && <source src={mobileSrc} media="(max-width: 767px)" />}
              <source src={src} />
              Your browser does not support the video tag.
          </video>
      );
  } else {
      mediaContent = (
        <>
          {mobileSrc && <source media="(max-width: 767px)" srcSet={mobileSrc} />}
          <img 
            id={!isLink ? finalId : undefined}
            src={imageSrc} 
            alt={effectiveAlt} 
            className={mediaClass} 
            style={mediaStyle} 
          />
        </>
      );
  }

  const content = (mobileSrc && !isVideoFile(src) && !isYoutube(src) && !isVimeo(src)) ? (
     <picture style={{ display: 'contents' }}>{mediaContent}</picture>
  ) : mediaContent;

  if (isLink) {
    const isDialog = linkType === 'dialog' && targetDialogId;
    const wrapperStyle = { ...style, display: 'block', width: '100%', textDecoration: 'none' };
    
    if (isDialog) {
        return (
            <a
                id={finalId}
                href="#"
                className={baseClassName}
                style={{ ...wrapperStyle, cursor: 'pointer' }}
                onClick={(e) => {
                     e.preventDefault();
                     openDialog(targetDialogId);
                }}
            >
                {content}
            </a>
        );
    }

    return (
      <a
         id={finalId}
         href={href || '#'} 
         className={baseClassName} 
         style={wrapperStyle}
      >
        {content}
      </a>
    );
  }

  return content;
};

const SocialIcons = {
    facebook: (
        <div className={`${styles.socialIcon} icon-social-mask icon-social-facebook`} />
    ),
    twitter: (
        <div className={`${styles.socialIcon} icon-social-mask icon-social-x`} />
    ),
    instagram: (
        <div className={`${styles.socialIcon} icon-social-mask icon-social-instagram`} />
    ),
    tiktok: (
        <div className={`${styles.socialIcon} icon-social-mask icon-social-tiktok`} />
    ),
    youtube: (
        <div className={`${styles.socialIcon} icon-social-mask icon-social-youtube`} />
    ),
};

export default function FooterTerra({
    image = componentDefaults["footer-terra"].image,
    imageId,
    imageVisible,
    copyrightText = componentDefaults["footer-terra"].copyrightText,
    socialLinks = componentDefaults["footer-terra"].socialLinks,
    availableAtTitle = componentDefaults["footer-terra"].availableAtTitle,
    findUsOnLinks = componentDefaults["footer-terra"].findUsOnLinks,
    resourcesTitle = componentDefaults["footer-terra"].resourcesTitle,
    resourceLinks = componentDefaults["footer-terra"].resourceLinks,
    onUpdate,
    sectionId,
    fullWidth,
    removePaddingLeft,
    removePaddingRight
}) {
    const update = createUpdateHandler(onUpdate);
    const defaults = componentDefaults["footer-terra"];

    return (
        <footer className={styles.footer} id={sectionId}>
            <div className={getContainerClasses({ fullWidth, removePaddingLeft, removePaddingRight })}>
                <div className={`grid items-center-desktop`}>
                    {/* Left Column: Logo */}
                    <div className={`col-mobile-4 col-tablet-8 col-desktop-6`}>
                        <div className={styles.leftColumn}>
                            <div className={styles.logoWrapper}>
                                <BuilderImage
                                    src={image}
                                    onSrcChange={undefined}
                                    className={`${styles.image} object-contain`}
                                    id={imageId}
                                    sectionId={sectionId}
                                    isVisible={imageVisible}
                                    onIdChange={undefined}
                                    suffix="logo"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Available at (Tersedia Di) */}
                    <div className={`col-mobile-4 col-tablet-4 col-desktop-3`}>
                        <div className={styles.column}>
                            <BuilderText
                                tagName="p"
                                className={`body-bold ${styles.columnTitle} truncate-1-line`}
                                content={availableAtTitle || defaults.availableAtTitle}
                                onChange={undefined}
                                sectionId={sectionId}
                                suffix="available-at-title"
                            />
                            <div className={styles.linkList}>
                                {findUsOnLinks.slice(0, 3).map((link, index) => (
                                    <div key={link.id || index} className={styles.linkWrapper}>
                                        <BuilderLink
                                            id={link.id}
                                            label={link.label}
                                            href={link.url}
                                            isVisible={link.visible}
                                            showLinkType={false}
                                            sectionId={sectionId}
                                            onLabelChange={(val) => {
                                                const newLinks = [...findUsOnLinks];
                                                newLinks[index].label = val;
                                                undefined(newLinks);
                                            }}
                                            onHrefChange={(val) => {
                                                const newLinks = [...findUsOnLinks];
                                                newLinks[index].url = val;
                                                undefined(newLinks);
                                            }}
                                            onIdChange={(val) => {
                                                const newLinks = [...findUsOnLinks];
                                                newLinks[index].id = val;
                                                undefined(newLinks);
                                            }}
                                            onVisibilityChange={(val) => {
                                                const newLinks = [...findUsOnLinks];
                                                newLinks[index].visible = val;
                                                undefined(newLinks);
                                            }}
                                            justify="flex-start"
                                            iconLeft={
                                                <div style={{ width: 16, height: 16, position: 'relative', overflow: 'hidden' }}>
                                                    <BuilderImage
                                                        src={link.image}
                                                        onSrcChange={(val) => {
                                                            const newLinks = [...findUsOnLinks];
                                                            newLinks[index].image = val;
                                                            undefined(newLinks);
                                                        }}
                                                        id={link.imageId}
                                                        onIdChange={(val) => {
                                                            const newLinks = [...findUsOnLinks];
                                                            newLinks[index].imageId = val;
                                                            undefined(newLinks);
                                                        }}
                                                        sectionId={sectionId}
                                                        suffix={`available-at-icon-${index}`}
                                                        className="object-contain"
                                                        style={{ width: '100%', height: '100%' }}
                                                        showLinkControls={false}
                                                    />
                                                </div>
                                            }
                                            className={`${styles.linkFooter} body-regular`}
                                            suffix={`link-${index + 1}`}
                                            fullWidth={true}
                                            tooltipIfTruncated={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Follow Us (Ikuti Kami) */}
                    <div className={`col-mobile-4 col-tablet-4 col-desktop-3`}>
                        <div className={styles.column}>
                            <BuilderText
                                tagName="p"
                                className={`body-bold ${styles.columnTitle} truncate-1-line`}
                                content={resourcesTitle || defaults.resourcesTitle}
                                onChange={undefined}
                                sectionId={sectionId}
                                suffix="resources-title"
                            />
                            <div className={styles.linkList}>
                                {socialLinks.slice(0, 3).map((link, index) => (
                                    <div key={link.id || index} className={styles.linkWrapper}>
                                        <BuilderLink
                                            id={link.id}
                                            label={link.label}
                                            href={link.url}
                                            isVisible={link.visible}
                                            showLinkType={false}
                                            sectionId={sectionId}
                                            onLabelChange={(val) => {
                                                const newLinks = [...socialLinks];
                                                newLinks[index].label = val;
                                                undefined(newLinks);
                                            }}
                                            onHrefChange={(val) => {
                                                const newLinks = [...socialLinks];
                                                newLinks[index].url = val;
                                                undefined(newLinks);
                                            }}
                                            onIdChange={(val) => {
                                                const newLinks = [...socialLinks];
                                                newLinks[index].id = val;
                                                undefined(newLinks);
                                            }}
                                            onVisibilityChange={(val) => {
                                                const newLinks = [...socialLinks];
                                                newLinks[index].visible = val;
                                                undefined(newLinks);
                                            }}
                                            justify="flex-start"
                                            iconLeft={
                                                <div style={{ width: 16, height: 16, position: 'relative', overflow: 'hidden' }}>
                                                    <BuilderImage
                                                        src={link.image}
                                                        onSrcChange={(val) => {
                                                            const newLinks = [...socialLinks];
                                                            newLinks[index].image = val;
                                                            undefined(newLinks);
                                                        }}
                                                        id={link.imageId}
                                                        onIdChange={(val) => {
                                                            const newLinks = [...socialLinks];
                                                            newLinks[index].imageId = val;
                                                            undefined(newLinks);
                                                        }}
                                                        sectionId={sectionId}
                                                        suffix={`social-icon-${index}`}
                                                        className="object-contain"
                                                        style={{ width: '100%', height: '100%' }}
                                                        showLinkControls={false}
                                                    />
                                                </div>
                                            }
                                            className={`${styles.linkFooter} body-regular`}
                                            suffix={`social-${index + 1}`}
                                            fullWidth={true}
                                            tooltipIfTruncated={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className={styles.divider} />

                {/* Bottom Bar: Copyright & Legal Links */}
                <div className={`${styles.bottomBar} grid items-center`}>
                    <div className="col-mobile-4 col-tablet-4 col-desktop-9">
                        <div className={styles.column}>
                            <BuilderText
                                tagName="p"
                                className={`caption-regular ${styles.copyright}`}
                                content={copyrightText || defaults.copyrightText}
                                onChange={undefined}
                                sectionId={sectionId}
                                suffix="copyright"
                            />
                        </div>
                    </div>
                    <div className="col-mobile-4 col-tablet-4 col-desktop-3">
                        <div className={styles.column}>
                            <div className={styles.legalLinks}>
                                {resourceLinks.map((link, index) => (
                                    <BuilderLink
                                        key={link.id || index}
                                        id={link.id}
                                        label={link.label}
                                        href={link.url}
                                        isVisible={link.visible}
                                        showLinkType={false}
                                        sectionId={sectionId}
                                        onLabelChange={(val) => {
                                            const newLinks = [...resourceLinks];
                                            newLinks[index].label = val;
                                            undefined(newLinks);
                                        }}
                                        onHrefChange={(val) => {
                                            const newLinks = [...resourceLinks];
                                            newLinks[index].url = val;
                                            undefined(newLinks);
                                        }}
                                        onVisibilityChange={(val) => {
                                            const newLinks = [...resourceLinks];
                                            newLinks[index].visible = val;
                                            undefined(newLinks);
                                        }}
                                        className={`${styles.legalLink} caption-regular`}
                                        suffix={`legal-${index + 1}`}
                                        justify="flex-start"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

