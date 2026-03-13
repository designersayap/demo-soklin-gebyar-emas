import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from "./navigation.module.css";
const DEFAULT_PLACEHOLDER_IMAGE = "https://space.lunaaar.site/assets-lunar/placeholder.svg";
import { createUpdateHandler } from "./component-helpers";
import { componentDefaults } from "./data";
import { Bars3Icon } from '@heroicons/react/24/solid';


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

// Shim for BuilderSection
const BuilderSection = ({ tagName = 'div', className, innerContainer, fullWidth, style, children, id, sectionId, isVisible = true, removePaddingLeft, removePaddingRight }) => {
  if (!isVisible) return null;
  const Tag = tagName;
  const normalizedSectionId = (sectionId && typeof sectionId === 'string') ? sectionId.replace(/-+$/, '') : '';
  let finalId = id || normalizedSectionId;
  finalId = finalId ? finalId.replace(/-+/g, '-') : undefined;
  
  const containerClasses = ["container-grid"];
  if (removePaddingLeft === true || removePaddingLeft === "true") containerClasses.push("pl-0");
  if (removePaddingRight === true || removePaddingRight === "true") containerClasses.push("pr-0");
  if (fullWidth === true || fullWidth === "true") containerClasses.push("container-full");
  const containerClass = containerClasses.join(" ");
  
  if (innerContainer) {
    return (
      <Tag id={finalId} className={className} style={style}>
        <div className={containerClass}>
          {children}
        </div>
      </Tag>
    );
  }

  return <Tag id={finalId} className={`${containerClass} ${className || ''}`} style={style}>{children}</Tag>;
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

export default function NavigationCenter({
    sectionId,
    logo = componentDefaults["navigation-center"].logo,
    logoId,
    logoVisible,

    menu1Label = componentDefaults["navigation-center"].menu1Label,
    menu1Url = componentDefaults["navigation-center"].menu1Url,
    menu1Visible = true,
    menu1LinkType = componentDefaults["navigation-center"].menu1LinkType,
    menu1TargetDialogId = componentDefaults["navigation-center"].menu1TargetDialogId,
    menu1Id,

    menu2Label = componentDefaults["navigation-center"].menu2Label,
    menu2Url = componentDefaults["navigation-center"].menu2Url,
    menu2Visible = true,
    menu2LinkType = componentDefaults["navigation-center"].menu2LinkType,
    menu2TargetDialogId = componentDefaults["navigation-center"].menu2TargetDialogId,
    menu2Id,

    menu3Label = componentDefaults["navigation-center"].menu3Label,
    menu3Url = componentDefaults["navigation-center"].menu3Url,
    menu3Visible = true,
    menu3LinkType = componentDefaults["navigation-center"].menu3LinkType,
    menu3TargetDialogId = componentDefaults["navigation-center"].menu3TargetDialogId,
    menu3Id,

    menu4Label = componentDefaults["navigation-center"].menu4Label,
    menu4Url = componentDefaults["navigation-center"].menu4Url,
    menu4Visible = true,
    menu4LinkType = componentDefaults["navigation-center"].menu4LinkType,
    menu4TargetDialogId = componentDefaults["navigation-center"].menu4TargetDialogId,
    menu4Id,
    isOverlay, // Added prop
    menuColor, // Added prop
    onUpdate
}) {
    const update = createUpdateHandler(onUpdate);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [portalContainer, setPortalContainer] = useState(null);

    // Check for empty, null, or matching the specific placeholder ID structure
    const isPlaceholder = !logo || (typeof logo === 'string' && logo.includes('assets-lunar/placeholder.svg'));
    const logoStyle = {
        objectFit: isPlaceholder ? 'cover' : 'contain',
        borderRadius: isPlaceholder ? '0px' : undefined
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPortalContainer(document.body);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Check window scroll first (Staging/Export)
            let scrollTop = window.scrollY;

            const canvasContainer = document.getElementById('canvas-scroll-container');
            if (canvasContainer) {
                scrollTop = canvasContainer.scrollTop;
            }

            if (scrollTop > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        // Attach to window (for Staging/Export)
        window.addEventListener('scroll', handleScroll);

        // Attach to builder canvas (for Page Builder)
        // Use a retry mechanism to ensure we find the container even if it mounts slightly later
        const attachScrollListener = (retries = 0) => {
            const canvasContainer = document.getElementById('canvas-scroll-container');
            if (canvasContainer) {
                canvasContainer.addEventListener('scroll', handleScroll);
                // Trigger once to set initial state
                handleScroll();
            } else if (retries < 10) {
                setTimeout(() => attachScrollListener(retries + 1), 200);
            }
        };

        attachScrollListener();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            const canvasContainer = document.getElementById('canvas-scroll-container');
            if (canvasContainer) {
                canvasContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const menuItems = [
        {
            label: menu1Label,
            url: menu1Url,
            visible: menu1Visible,
            linkType: menu1LinkType,
            targetDialogId: menu1TargetDialogId,
            id: menu1Id,
            handlers: {
                onLabelChange: undefined,
                onUrlChange: undefined,
                onLinkTypeChange: undefined,
                onTargetDialogIdChange: undefined,
                onIdChange: undefined
            },
            suffix: 'menu-1',
            mobileSuffix: 'mobile-menu-1'
        },
        {
            label: menu2Label,
            url: menu2Url,
            visible: menu2Visible,
            linkType: menu2LinkType,
            targetDialogId: menu2TargetDialogId,
            id: menu2Id,
            handlers: {
                onLabelChange: undefined,
                onUrlChange: undefined,
                onLinkTypeChange: undefined,
                onTargetDialogIdChange: undefined,
                onIdChange: undefined
            },
            suffix: 'menu-2',
            mobileSuffix: 'mobile-menu-2'
        },
        {
            label: menu3Label,
            url: menu3Url,
            visible: menu3Visible,
            linkType: menu3LinkType,
            targetDialogId: menu3TargetDialogId,
            id: menu3Id,
            handlers: {
                onLabelChange: undefined,
                onUrlChange: undefined,
                onLinkTypeChange: undefined,
                onTargetDialogIdChange: undefined,
                onIdChange: undefined
            },
            suffix: 'menu-3',
            mobileSuffix: 'mobile-menu-3'
        },
        {
            label: menu4Label,
            url: menu4Url,
            visible: menu4Visible,
            linkType: menu4LinkType,
            targetDialogId: menu4TargetDialogId,
            id: menu4Id,
            handlers: {
                onLabelChange: undefined,
                onUrlChange: undefined,
                onLinkTypeChange: undefined,
                onTargetDialogIdChange: undefined,
                onIdChange: undefined
            },
            suffix: 'menu-4',
            mobileSuffix: 'mobile-menu-4'
        }
    ];

    return (
        <BuilderSection
            tagName="nav"
            className={`${styles.navigationWrapper} z-content-1 ${isScrolled ? styles.scrolled : ''} ${menuColor === 'invert' ? styles.invert : ''}`}
            sectionId={sectionId}

            isOverlay={isOverlay}
            menuColor={menuColor}
            showMenuColorToggle={true}
            fullWidth={true}
            showFullWidthControl={false}
        >
            <div className="container-grid">
                <div className="grid align-center">
                    {menuItems.slice(0, 2).map((item, index) => (
                        <div
                            key={`desktop-${item.suffix}`}
                            className={`col-desktop-2 ${index === 0 ? 'offset-desktop-1 offset-tablet-1' : ''} ${styles.desktopNav} ${styles.menuItemWrapper}`}
                        >
                            <div className={styles.truncatedText}>
                                <BuilderLink
                                    label={item.label}
                                    href={item.url}
                                    onLabelChange={item.handlers.onLabelChange}
                                    onHrefChange={item.handlers.onUrlChange}
                                    sectionId={sectionId}
                                    id={item.id}
                                    onIdChange={item.handlers.onIdChange}
                                    className={`${styles.linkNav} body-bold`}
                                    suffix={item.suffix}
                                    fullWidth={true}
                                    isVisible={item.visible}
                                    linkType={item.linkType}
                                    targetDialogId={item.targetDialogId}
                                    onLinkTypeChange={item.handlers.onLinkTypeChange}
                                    onTargetDialogIdChange={item.handlers.onTargetDialogIdChange}
                                    tooltipIfTruncated={true}
                                />
                            </div>
                        </div>
                    ))}

                    <div className={`col-desktop-2 col-tablet-2 ${styles.desktopNav} ${styles.logoWrapper}`}>
                        <div className={styles.logoContainer}>
                            <BuilderImage
                                src={logo}
                                onSrcChange={undefined}
                                id={logoId}
                                sectionId={sectionId}
                                onIdChange={undefined}
                                isVisible={logoVisible}
                                suffix="logo"
                                className={styles.logoImage}
                                style={logoStyle}
                                showLinkControls={false}
                                alwaysShowSrc={false}
                            />
                        </div>
                    </div>

                    {menuItems.slice(2, 4).map((item) => (
                        <div
                            key={`desktop-${item.suffix}`}
                            className={`col-desktop-2 ${styles.desktopNav} ${styles.menuItemWrapper}`}
                        >
                            <div className={styles.truncatedText}>
                                <BuilderLink
                                    label={item.label}
                                    href={item.url}
                                    onLabelChange={item.handlers.onLabelChange}
                                    onHrefChange={item.handlers.onUrlChange}
                                    sectionId={sectionId}
                                    id={item.id}
                                    onIdChange={item.handlers.onIdChange}
                                    className={`${styles.linkNav} body-bold`}
                                    suffix={item.suffix}
                                    fullWidth={true}
                                    isVisible={item.visible}
                                    linkType={item.linkType}
                                    targetDialogId={item.targetDialogId}
                                    onLinkTypeChange={item.handlers.onLinkTypeChange}
                                    onTargetDialogIdChange={item.handlers.onTargetDialogIdChange}
                                    tooltipIfTruncated={true}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Mobile Layout */}
                    <div className={`col-mobile-2 col-tablet-4 ${styles.mobileNav} ${styles.mobileLogoWrapper}`}>
                        <div className={styles.logoContainer}>
                            <BuilderImage
                                src={logo}
                                id={logoId}
                                isVisible={logoVisible}
                                readOnly={true}
                                className={styles.logoImage}
                                style={logoStyle}
                            />
                        </div>
                    </div>

                    {(() => {
                        const hasVisibleMenu = menuItems.some(item => item.visible);

                        return (
                            <div className={`col-mobile-2 col-tablet-4 ${styles.mobileNav} ${styles.mobileBurgerWrapper}`}>
                                {hasVisibleMenu && (
                                    <button
                                        className={styles.burgerButton}
                                        onClick={() => setIsMobileMenuOpen(true)}
                                    >
                                        <Bars3Icon style={{ width: 24, height: 24 }} />
                                    </button>
                                )}
                            </div>
                        );
                    })()}

                </div >
            </div>

            {/* Mobile Menu Dialog - Rendered via Portal */}
            {
                portalContainer && createPortal(
                    <>
                        <div className="overlay z-system-modal-fullscreen" onClick={() => setIsMobileMenuOpen(false)} style={{ display: isMobileMenuOpen ? 'flex' : 'none', pointerEvents: 'auto' }} />
                        <div className={`${styles.dialogWrapper} z-system-modal-fullscreen ${isMobileMenuOpen ? styles.open : ''}`}>
                            <div className="container-grid">
                                <div className="grid">
                                    <div className={`${styles.mobileDialog} col-12 col-mobile-4 col-tablet-4 col-desktop-6 offset-desktop-3 offset-tablet-2`}>
                                        {menuItems.map((item) => (
                                            <div key={`mobile-${item.mobileSuffix}`} className={styles.mobileMenuLink}>
                                                <BuilderLink
                                                    label={item.label}
                                                    href={item.url}
                                                    onHrefChange={item.handlers.onUrlChange}
                                                    sectionId={sectionId}
                                                    id={undefined}
                                                    suffix={item.mobileSuffix}
                                                    className={`${styles.mobileLinkText} ${styles.linkNav} body-bold`}
                                                    fullWidth={true}
                                                    isVisible={item.visible}
                                                    linkType={item.linkType}
                                                    targetDialogId={item.targetDialogId}
                                                    onLinkTypeChange={item.handlers.onLinkTypeChange}
                                                    onTargetDialogIdChange={item.handlers.onTargetDialogIdChange}
                                                    tooltipIfTruncated={true}
                                                />
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </>,
                    portalContainer
                )
            }
        </BuilderSection>
    );
}
