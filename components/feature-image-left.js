import * as HeroIcons from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';

import styles from "./feature-image-left.module.css";
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

// Shim for BuilderButton
const BuilderButton = ({ label, href, className, style, children, linkType, targetDialogId, id, sectionId, suffix, iconLeft, iconRight, hideLabel, isVisible = true }) => {
  if (!isVisible) return null;
  const normalizedSectionId = (sectionId && typeof sectionId === 'string') ? sectionId.replace(/-+$/, '') : '';
  let finalId = id || (normalizedSectionId && suffix ? normalizedSectionId + '-' + suffix : undefined);
  finalId = finalId ? finalId.replace(/-+/g, '-') : undefined;

  // Resolve Icons
  const renderIcon = (icon) => {
      if (!icon) return null;
      if (typeof icon === 'string' && HeroIcons[icon]) {
          const IconComponent = HeroIcons[icon];
          return <IconComponent className="w-5 h-5" />;
      }
      return icon;
  };

  const content = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 'inherit' }}>
         {renderIcon(iconLeft) && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{renderIcon(iconLeft)}</span>}
         {!hideLabel && (
             <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {label || children}
             </div>
         )}
         {renderIcon(iconRight) && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{renderIcon(iconRight)}</span>}
      </div>
  );

  if (linkType === 'dialog' && targetDialogId) {
    return (
      <a
        id={finalId}
        href="#"
        className={className}
        style={{ ...style, cursor: 'pointer', textDecoration: 'none' }}
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

export default function FeatureImageLeft({
    title = componentDefaults["feature-image-left"].title,
    subtitle = componentDefaults["feature-image-left"].subtitle,
    buttonText = componentDefaults["feature-image-left"].buttonText,
    buttonUrl = componentDefaults["feature-image-left"].buttonUrl,
    buttonVisible = componentDefaults["feature-image-left"].buttonVisible,
    buttonLinkType = componentDefaults["feature-image-left"].buttonLinkType || "url",
    buttonTargetDialogId = componentDefaults["feature-image-left"].buttonTargetDialogId,
    buttonIconLeft = componentDefaults["feature-image-left"].buttonIconLeft,
    buttonIconRight = componentDefaults["feature-image-left"].buttonIconRight,
    secondaryButtonText = componentDefaults["feature-image-left"].secondaryButtonText,
    secondaryButtonUrl = componentDefaults["feature-image-left"].secondaryButtonUrl,
    secondaryButtonVisible = componentDefaults["feature-image-left"].secondaryButtonVisible,
    secondaryButtonLinkType = componentDefaults["feature-image-left"].secondaryButtonLinkType || "url",
    secondaryButtonTargetDialogId = componentDefaults["feature-image-left"].secondaryButtonTargetDialogId,
    secondaryButtonIconLeft = componentDefaults["feature-image-left"].secondaryButtonIconLeft,
    secondaryButtonIconRight = componentDefaults["feature-image-left"].secondaryButtonIconRight,
    image = componentDefaults["feature-image-left"].image,
    imageId,
    imageVisible,
    imageUrl,
    imageLinkType,
    imageTargetDialogId,
    buttonStyle = "primary",
    secondaryButtonStyle = "ghost",
    buttonId,
    secondaryButtonId,
    onUpdate,
    sectionId,
    fullWidth,
    removePaddingLeft,
    removePaddingRight,
    titleVisible = true,
    subtitleVisible = true,
    titleId,
    subtitleId,
    imageRatio
}) {
    const update = createUpdateHandler(onUpdate);

    return (
        <section className={styles.container} id={sectionId}>
            <div className={getContainerClasses({ fullWidth, removePaddingLeft, removePaddingRight })}>
                <div className="grid align-center">
                    <div className={`imageWrapper ${styles.imageWrapper} col-mobile-4 col-tablet-4 col-desktop-6`} style={{ paddingRight: "var(--gap-md)", paddingLeft: "var(--gap-md)" }}>
                        <BuilderImage
                            src={image}
                            onSrcChange={undefined}
                            className=""
                            style={{ aspectRatio: (imageRatio || '1-1').replace('-', '/') }}
                            id={imageId}
                            sectionId={sectionId}
                            isVisible={imageVisible}
                            onIdChange={undefined}
                            suffix="image"
                            href={imageUrl}
                            onHrefChange={undefined}
                            linkType={imageLinkType}
                            onLinkTypeChange={undefined}
                            targetDialogId={imageTargetDialogId}
                            onTargetDialogIdChange={undefined}
                            aspectRatio={imageRatio}
                            onAspectRatioChange={undefined}
                        />
                    </div>

                    <div className={`${styles.content} col-mobile-4 col-tablet-4 col-desktop-6`}>
                        {titleVisible && (
                            <BuilderText
                                tagName="h2"
                                className={`h2 ${styles.title}`}
                                style={{ marginBottom: "var(--gap-sm)" }}
                                content={title}
                                onChange={undefined}
                                sectionId={sectionId}
                                id={titleId}
                                suffix="title"
                                onIdChange={undefined}
                            />
                        )}
                        {subtitleVisible && (
                            <BuilderText
                                tagName="div"
                                className="subheader-h2"
                                style={{ color: "var(--content-neutral--body)", marginBottom: "var(--gap-md)" }}
                                content={subtitle}
                                onChange={undefined}
                                sectionId={sectionId}
                                id={subtitleId}
                                suffix="subtitle"
                                onIdChange={undefined}
                            />
                        )}
                        <div className="buttonWrapperLeft" suppressHydrationWarning>
                            {buttonVisible && (
                                <BuilderButton
                                    label={buttonText}
                                    href={buttonUrl}
                                    isVisible={buttonVisible}
                                    sectionId={sectionId}
                                    className={`btn btn-${buttonStyle} btn-lg`}
                                    iconLeft={buttonIconLeft}
                                    iconRight={buttonIconRight}
                                    onLabelChange={undefined}
                                    onHrefChange={undefined}
                                    onVisibilityChange={undefined}
                                    onVariantChange={undefined}
                                    linkType={buttonLinkType}
                                    onLinkTypeChange={undefined}
                                    targetDialogId={buttonTargetDialogId}
                                    onTargetDialogIdChange={undefined}
                                    onIconLeftChange={undefined}
                                    onIconRightChange={undefined}
                                    id={buttonId}
                                    onIdChange={undefined}
                                    suffix="button"
                                />
                            )}
                            {secondaryButtonVisible && (
                                <BuilderButton
                                    label={secondaryButtonText}
                                    href={secondaryButtonUrl}
                                    isVisible={secondaryButtonVisible}
                                    sectionId={sectionId}
                                    className={`btn btn-${secondaryButtonStyle} btn-lg`}
                                    onLabelChange={undefined}
                                    onHrefChange={undefined}
                                    onVisibilityChange={undefined}
                                    onVariantChange={undefined}
                                    linkType={secondaryButtonLinkType}
                                    onLinkTypeChange={undefined}
                                    targetDialogId={secondaryButtonTargetDialogId}
                                    onTargetDialogIdChange={undefined}
                                    iconLeft={secondaryButtonIconLeft}
                                    iconRight={secondaryButtonIconRight}
                                    onIconLeftChange={undefined}
                                    onIconRightChange={undefined}
                                    id={secondaryButtonId}
                                    onIdChange={undefined}
                                    suffix="secondary-button"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
