export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
