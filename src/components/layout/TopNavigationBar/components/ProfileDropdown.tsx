'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import avatar1 from '@/assets/images/users/main-image.jpeg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'react-bootstrap';
import { API_BASE_PATH } from "@/context/constants";

const ProfileDropdown = () => {
  const [fullName, setFullName] = useState<string>('User');
  const [avatarUrl, setAvatarUrl] = useState<string>(avatar1.src); // Default to local image

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const res = await axios.get(`${API_BASE_PATH}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.data?.user?.team.full_name) {
          setFullName(res.data.user.team.full_name);
        }
        if (res.data?.user?.team.photo) {
          setAvatarUrl(res.data.user.team.photo); // Use API photo field
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <Dropdown className="topbar-item" drop="down">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown "
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="d-flex align-items-center">
          <Image
            className="rounded-circle"
            width={32}
            height={32}
            src={avatarUrl}
            alt="avatar"
          />
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownHeader as={'h6'} className="dropdown-header">
          Welcome {fullName}!
        </DropdownHeader>
        <DropdownItem as={Link} href="/profile/details">
          {/* <IconifyIcon icon="solar:user-broken" className="align-middle me-2 fs-18" /> */}
          <IconifyIcon icon="mdi:account" className="align-middle me-2 fs-18" />


          <span className="align-middle">My Profile</span>
        </DropdownItem>
        <DropdownItem as={Link} href="/pages/pricing">
          <IconifyIcon icon="solar:wallet-broken" className="align-middle me-2 fs-18" />
          <span className="align-middle">Help & Support</span>
        </DropdownItem>
        <DropdownItem as={Link} href="/support/faqs">
          <IconifyIcon icon="solar:help-broken" className="align-middle me-2 fs-18" />
          <span className="align-middle">Privacy & Conditions</span>
        </DropdownItem>
        <div className="dropdown-divider my-1" />
        <DropdownItem as={Link} className=" text-danger" href="/auth/sign-in">
          <IconifyIcon icon="solar:logout-3-broken" className="align-middle me-2 fs-18" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;

