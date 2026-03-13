import * as HeroIcons from '@heroicons/react/24/solid';
import { useState } from 'react';
import Link from 'next/link';

import { componentDefaults } from "./data";
import { createUpdateHandler } from "./component-helpers";
import styles from "./header-section.module.css";
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

export default function HeaderSection({
    title = componentDefaults["header-section"].title,
    subtitle = componentDefaults["header-section"].subtitle,
    sectionId,
    // Button props...
    buttonText = componentDefaults["header-section"].buttonText,
    buttonUrl = componentDefaults["header-section"].buttonUrl,
    buttonVisible = componentDefaults["header-section"].buttonVisible,
    buttonLinkType = componentDefaults["header-section"].buttonLinkType || "url",
    buttonTargetDialogId = componentDefaults["header-section"].buttonTargetDialogId,
    buttonIconLeft = componentDefaults["header-section"].buttonIconLeft,
    buttonIconRight = componentDefaults["header-section"].buttonIconRight,
    secondaryButtonText = componentDefaults["header-section"].secondaryButtonText,
    secondaryButtonUrl = componentDefaults["header-section"].secondaryButtonUrl,
    secondaryButtonVisible = componentDefaults["header-section"].secondaryButtonVisible,
    secondaryButtonLinkType = componentDefaults["header-section"].secondaryButtonLinkType || "url",
    secondaryButtonTargetDialogId = componentDefaults["header-section"].secondaryButtonTargetDialogId,
    secondaryButtonIconLeft = componentDefaults["header-section"].secondaryButtonIconLeft,
    secondaryButtonIconRight = componentDefaults["header-section"].secondaryButtonIconRight,
    buttonId,
    secondaryButtonId,
    buttonStyle = "primary",
    secondaryButtonStyle = "ghost",
    onUpdate,
    titleVisible = true,
    subtitleVisible = true,
    titleId,
    subtitleId
}) {
    const update = createUpdateHandler(onUpdate);

    return (
        <section className={`${styles.section}`} id={sectionId}>
            <div className={getContainerClasses({})}>
                <div className="grid">
                    <div className={`col-mobile-4 col-tablet-8 col-desktop-8 offset-desktop-2 ${styles.content}`}>
                        {titleVisible && (
                            <BuilderText
                                tagName="h2"
                                className={`h2 ${styles.title}`}
                                style={{ marginBottom: "var(--gap-md)" }}
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
                                className={`subheader-h1 ${styles.subtitle}`}
                                style={{ marginBottom: "var(--gap-lg)" }}
                                content={subtitle}
                                onChange={undefined}
                                sectionId={sectionId}
                                id={subtitleId}
                                suffix="subtitle"
                                onIdChange={undefined}
                            />
                        )}
                        <div className="buttonWrapperCenter">
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
