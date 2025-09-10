import { Container } from 'react-bootstrap';
import LeftSideBarToggle from './components/LeftSideBarToggle';
import ProfileDropdown from './components/ProfileDropdown';

const page = () => {
  return (
    <header>
      <div className="topbar">
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2">
              <LeftSideBarToggle />
              <form className="app-search d-none d-md-block me-auto">
                {/* <div className="position-relative">
                  <input type="search" className="form-control border-0" placeholder="Search..." autoComplete="off" />
                  <IconifyIcon icon="ri:search-line" className=" search-widget-icon" />
                </div> */}
                {/* <Dropdownselector /> */}
              </form>
            </div>
            <div className="d-flex align-items-center gap-1">
              {/*<ThemeModeToggle /> */}

              {/* <MaximizeScreen /> */}

              {/* <Notifications /> */}

              {/* <ThemeCustomizerToggle /> */}

              <ProfileDropdown />
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default page;
