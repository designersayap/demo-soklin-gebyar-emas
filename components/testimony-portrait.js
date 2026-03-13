"use client";
import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./testimony-portrait.module.css";
const DEFAULT_PLACEHOLDER_IMAGE = "https://space.lunaaar.site/assets-lunar/placeholder.svg";
import { componentDefaults } from "./data";


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

// Shim for BuilderElement
const BuilderElement = ({ tagName = 'div', className, style, children, id, sectionId, elementProps, isVisible = true }) => {
  if (!isVisible) return null;
  const Tag = tagName;
  const normalizedSectionId = (sectionId && typeof sectionId === 'string') ? sectionId.replace(/-+$/, '') : '';
  const suffix = elementProps || 'element';
  let finalId = id || (normalizedSectionId ? normalizedSectionId + '-' + suffix : undefined);
  finalId = finalId ? finalId.replace(/-+/g, '-') : undefined;
  return <Tag id={finalId} className={className} style={style}>{children}</Tag>;
};

export default function TestimonyPortrait({
    testimonies: rawTestimonies = componentDefaults["testimony-portrait"].testimonies,
    sectionId,
    onUpdate,
    fullWidth,
    removePaddingLeft,
    removePaddingRight,
    autoScroll = componentDefaults["testimony-portrait"].autoScroll,
    autoScrollEffect = componentDefaults["testimony-portrait"].autoScrollEffect,
    marqueeDuration = componentDefaults["testimony-portrait"].marqueeDuration
}) {
    // Sanitize data: remove null/undefined entries
    const testimonies = (rawTestimonies || []).filter(item => item !== null && typeof item === 'object');

    const isAutoScroll = autoScroll === true || autoScroll === "true";
    const isFullWidth = fullWidth === true || fullWidth === "true";

    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [totalItems, setTotalItems] = useState(testimonies.length);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Fix: Use a ref to hold the latest state so the callback can be stable
    // (BuilderText ignores prop changes to onChange for performance, so we must provide a stable function)
    const latestStateRef = useRef({ testimonies, onUpdate });
    latestStateRef.current = { testimonies, onUpdate };

    const updateTestimony = useCallback((index, key, value) => {
        const { testimonies: currentTestimonies, onUpdate: currentOnUpdate } = latestStateRef.current;
        if (!currentOnUpdate) return;

        const newTestimonies = [...currentTestimonies];
        newTestimonies[index] = { ...newTestimonies[index], [key]: value };
        currentOnUpdate({ testimonies: newTestimonies });
    }, []);

    const updateCardId = (index, newId) => {
        undefined;
    };

    const visibleCardsString = testimonies.map(t => t?.visible).join(',');

    useEffect(() => {
        const visibleTestimonies = testimonies.filter(t => t.visible !== false);
        setTotalItems(visibleTestimonies.length > 0 ? visibleTestimonies.length : (testimonies.length > 0 ? 1 : 0));
    }, [testimonies, visibleCardsString]);

    useEffect(() => {
        const calculatePages = () => {
            if (!scrollContainerRef.current) return;

            const container = scrollContainerRef.current;
            const containerWidth = container.scrollWidth;
            const viewportWidth = container.clientWidth;

            if (containerWidth && viewportWidth > 0) {
                const pages = Math.ceil(containerWidth / viewportWidth);
                setTotalPages(Number.isFinite(pages) ? Math.max(1, pages) : 1);
            } else {
                setTotalPages(1);
            }
        };

        // Delay calculation slightly to ensure DOM has updated
        const timer = setTimeout(calculatePages, 100);

        window.addEventListener('resize', calculatePages);
        return () => {
            window.removeEventListener('resize', calculatePages);
            clearTimeout(timer);
        };
    }, [testimonies.length, visibleCardsString]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const viewportWidth = container.clientWidth;
            const scrollWidth = container.scrollWidth;
            const maxScroll = scrollWidth - viewportWidth;

            // 1. Calculate Active Index (for 1-by-1 slide sequence)
            const items = Array.from(container.querySelectorAll(`.${styles.itemWrapper}`))
                .filter(item => item.offsetParent !== null);

            if (items.length > 0) {
                let closestIndex = 0;
                let minDistance = Infinity;

                items.forEach((item, index) => {
                    const distance = Math.abs(scrollLeft - item.offsetLeft);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                    }
                });

                if (closestIndex !== activeIndex) {
                    setActiveIndex(closestIndex);
                }
            }

            // 2. Calculate Current Page (for pagination indicators)
            // Use ratio-based calculation to handle small overflows correctly
            if (maxScroll > 0 && totalPages > 1) {
                const ratio = scrollLeft / maxScroll;
                const page = Math.round(ratio * (totalPages - 1));
                if (page !== currentPage) {
                    setCurrentPage(page);
                }
            } else if (currentPage !== 0) {
                setCurrentPage(0);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [activeIndex, currentPage]);

    const scrollToIndex = (index) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const items = Array.from(container.querySelectorAll(`.${styles.itemWrapper}`))
            .filter(item => item.offsetParent !== null);

        if (!items[index]) return;

        const item = items[index];
        const scrollPosition = item.offsetLeft;

        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    };

    const scrollToPage = (pageIndex) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const viewportWidth = container.clientWidth;
        const scrollPosition = pageIndex * viewportWidth;

        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    };

    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!autoScroll || isPaused || totalItems <= 1 || autoScrollEffect !== 'slide') return;

        const timer = setInterval(() => {
            const container = scrollContainerRef.current;
            if (!container) return;

            const { scrollLeft, scrollWidth, clientWidth } = container;
            const maxScroll = scrollWidth - clientWidth;

            // If we are at the end (or very close), reset to 0
            if (scrollLeft >= maxScroll - 10) {
                scrollToIndex(0);
            } else {
                scrollToIndex(activeIndex + 1);
            }
        }, 4000);

        return () => clearInterval(timer);
    }, [activeIndex, totalItems, isPaused, autoScroll, autoScrollEffect]);

    const visibleCount = testimonies.filter(t => t.visible !== false).length;
    let filteredTestimonies = testimonies;
    if (visibleCount === 0 && testimonies.length > 0) {
        // If no visible testimonies, show the first one as a fallback (minimum 1 card)
        const validFallback = testimonies.find(t => t !== null && typeof t === 'object');
        filteredTestimonies = validFallback ? [validFallback] : [];
    }

    // For marquee, we need enough items to fill the screen for a seamless loop
    const displayItems = [];
    let repeatCount = 1;

    // Filtered testimonies with their original indices
    const mappedTestimonies = filteredTestimonies.map((item, originalIndex) => ({
        data: item,
        originalIndex: testimonies.indexOf(item) // Get index from base testimonies array
    }));

    if (isAutoScroll && autoScrollEffect === 'marquee' && mappedTestimonies.length > 0) {
        // Aim for at least 24 items total to ensure the screen is always filled (matching landscape's wide buffer)
        repeatCount = Math.max(3, Math.ceil(24 / mappedTestimonies.length));
        for (let i = 0; i < repeatCount; i++) {
            displayItems.push(...mappedTestimonies);
        }
    } else {
        displayItems.push(...mappedTestimonies);
    }

    const shouldCenter = !isAutoScroll || (totalPages <= 1 && autoScrollEffect !== 'marquee');

    return (
        <BuilderSection
            tagName="section"
            className={styles.container}
            innerContainer={!isFullWidth}
            sectionId={sectionId}
            fullWidth={isFullWidth}
            removePaddingLeft={removePaddingLeft}
            removePaddingRight={removePaddingRight}

            showAutoScrollToggle={true}
            autoScroll={isAutoScroll}
            autoScrollEffect={autoScrollEffect}
            marqueeDuration={marqueeDuration}
        >
            <div className="grid">
                <div className="col-mobile-4 col-tablet-8 col-desktop-12">
                    <div className={styles.scrollWrapper}>
                        <div
                            ref={scrollContainerRef}
                            className={`${styles.cardsWrapper} ${isAutoScroll && autoScrollEffect === 'marquee' ? styles.marquee : ''}`}
                            style={{
                                justifyContent: shouldCenter ? 'center' : 'start',
                                '--marquee-repeat-count': repeatCount,
                                '--marquee-duration': `${marqueeDuration || 120}s`
                            }}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            data-paused={isPaused}
                        >
                            {displayItems.map(({ data: item, originalIndex }, index) => item && (
                                <BuilderElement
                                    key={index}
                                    tagName="div"
                                    className={styles.itemWrapper}
                                    id={item.cardId}
                                    sectionId={sectionId}
                                    onIdChange={(val) => undefined}
                                    elementProps={`testimony-${index}`}
                                    isVisible={item.visible !== false}
                                >
                                    <div className={styles.card}>
                                        <BuilderImage
                                            src={item.image}
                                            onSrcChange={(val) => undefined}
                                            className={styles.backgroundImage}
                                            id={item.imageId}
                                            sectionId={sectionId}
                                            isVisible={item.imageVisible}
                                            onIdChange={(val) => undefined}
                                            onVisibilityChange={(val) => undefined}
                                            suffix={`background-${index}`}
                                            href={item.imageUrl}
                                            onHrefChange={(val) => undefined}
                                            linkType={item.imageLinkType}
                                            onLinkTypeChange={(val) => undefined}
                                            targetDialogId={item.imageTargetDialogId}
                                            onTargetDialogIdChange={(val) => undefined}
                                        />

                                        <div className={styles.contentCard}>
                                            <div className={styles.avatarWrapper}>
                                                <BuilderImage
                                                    src={item.avatar}
                                                    onSrcChange={(val) => undefined}
                                                    className={'imagePlaceholder-1-1 object-cover'}
                                                    id={item.avatarId}
                                                    style={{ borderRadius: "var(--border-radius-round)" }}
                                                    sectionId={sectionId}
                                                    isVisible={item.avatarVisible}
                                                    onIdChange={(val) => undefined}
                                                    onVisibilityChange={(val) => undefined}
                                                    suffix={`avatar-${index}`}
                                                    href={item.avatarUrl}
                                                    onHrefChange={(val) => undefined}
                                                    linkType={item.avatarLinkType}
                                                    onLinkTypeChange={(val) => undefined}
                                                    targetDialogId={item.avatarTargetDialogId}
                                                    onTargetDialogIdChange={(val) => undefined}
                                                />
                                            </div>
                                            <BuilderText
                                                tagName="div"
                                                className={`h5 truncate-1-line ${styles.name}`}
                                                content={item.name || ""}
                                                onChange={(val) => undefined}
                                                sectionId={sectionId}
                                                tooltipIfTruncated={true}
                                                suffix="name"
                                            />

                                            <BuilderText
                                                tagName="div"
                                                className={`caption-regular ${styles.role}`}
                                                content={item.role || ""}
                                                onChange={(val) => undefined}
                                                sectionId={sectionId}
                                                suffix="role"
                                            />

                                            <BuilderText
                                                tagName="div"
                                                className={`caption-regular truncate-2-lines ${styles.description}`}
                                                content={item.description || ""}
                                                onChange={(val) => undefined}
                                                sectionId={sectionId}
                                                tooltipIfTruncated={true}
                                                suffix="description"
                                            />
                                        </div>
                                    </div>
                                </BuilderElement>
                            ))}
                        </div>
                    </div>

                    {totalPages > 1 && !(isAutoScroll && autoScrollEffect === 'marquee') && (
                        <div className="scroll-indicator-pills">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <div
                                    key={index}
                                    className={currentPage === index ? "indicator-pill-active" : "indicator-pill"}
                                    onClick={() => scrollToPage(index)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Go to page ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BuilderSection >
    );
}
