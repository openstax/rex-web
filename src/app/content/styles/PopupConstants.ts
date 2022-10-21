export const popupPadding = 3.2;
export const popupBodyPadding = 2.4;
export const popupHeaderZIndex = 5;
export const desktopVerticalMargin = 1.6;
export const desktopHorizontalMargin = 3.2;
export const mobilePaddingSides = 1.6;
export const mobilePaddingTopBottom = 1.4;
export const mobileMarginSides = 0.8;
export const mobileMarginTopBottom = 2;
export const barHeight = 6;
export const headerHeight = 7.2;
export const topBottomMargin = headerHeight + popupBodyPadding;
export const desktopPopupWidth = 74.4;

export const filters = {
  border: 0.1,
  dropdownContent: {
    minimumWhiteSpace: 3.2,
    padding: {
      sides: 1.6,
      topBottom: 0.8,
    },
  },
  dropdownToggle: {
    icon: {
      height: 2,
      width: 1,
    },
    sides: {
      desktop: 2.4,
      mobile: 1.6,
    },
    topBottom: {
      desktop: 2,
      mobile: 1,
    },
  },
  get valueToSubstractFromVH() {
    const desktopPaddingAndHeader = headerHeight + topBottomMargin;
    const mobilePaddingAndHeader = headerHeight + (mobileMarginTopBottom * 2);
    const buttonDesktopHeight = (this.dropdownToggle.topBottom.desktop * 2) + this.dropdownToggle.icon.height;
    const buttonMobileHeight = (this.dropdownToggle.topBottom.mobile * 2) + this.dropdownToggle.icon.height;
    return {
      desktop: this.dropdownContent.minimumWhiteSpace + desktopPaddingAndHeader + buttonDesktopHeight,
      mobile: Number(
        this.dropdownContent.minimumWhiteSpace + mobilePaddingAndHeader + buttonMobileHeight
      ).toFixed(1),
    };
  },
};
