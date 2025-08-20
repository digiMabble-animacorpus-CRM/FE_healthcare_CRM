'use client';
import properties1 from '@/assets/images/properties/p-1.jpg';
import properties2 from '@/assets/images/properties/p-2.jpg';
import properties3 from '@/assets/images/properties/p-3.jpg';
import properties4 from '@/assets/images/properties/p-4.jpg';
import properties5 from '@/assets/images/properties/p-5.jpg';
import trophyImg from '@/assets/images/trophy.png';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import { WorldVectorMap } from '@/components/VectorMap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselItem,
  Col,
  Row,
} from 'react-bootstrap';
import AgentDetailsCard from './AgentDetailsCard';

const AgentDetails = () => {
  const salesLocationOptions = {
    map: 'world',
    zoomOnScroll: true,
    zoomButtons: false,
    markersSelectable: true,
    markers: [
      { name: 'Canada', coords: [56.1304, -106.3468] },
      { name: 'Brazil', coords: [-14.235, -51.9253] },
      { name: 'Russia', coords: [61, 105] },
      { name: 'China', coords: [35.8617, 104.1954] },
      { name: 'United States', coords: [37.0902, -95.7129] },
    ],
    markerStyle: {
      initial: { fill: '#7f56da' },
      selected: { fill: '#1bb394' },
    },
    labels: {
      markers: {
        // render: (marker) => marker.name,
      },
    },
    regionStyle: {
      initial: {
        fill: 'rgba(169,183,197, 0.3)',
        fillOpacity: 1,
      },
    },
  };

  return (
    <Row className="justify-content-center">
      <Col xl={8} lg={12}>
        <AgentDetailsCard />
      </Col>
      <Col xl={4} lg={12}>
        <Card className="bg-light-subtle overflow-hidden z-1">
          <CardBody>
            <div className="d-flex align-items-center gap-2 mb-3">
              <Image src={avatar2} alt="avatar" className="avatar-md rounded-circle" />
              <div className="d-block">
                <h5 className="text-dark fw-medium">Michael A. Miner</h5>
                <p className=" mb-0 fw-medium">#1 Medal</p>
              </div>
              <div className="ms-auto">
                <div className="avatar bg-primary-subtle rounded flex-centered">
                  <IconifyIcon
                    width={28}
                    height={28}
                    icon="solar:cup-star-bold"
                    className="fs-28 text-primary"
                  />
                </div>
              </div>
            </div>
            <div className="p-3 position-relative overflow-hidden z-1 rounded bg-primary-subtle border border-primary-subtle mt-4 text-center">
              <Image src={trophyImg} alt="trophyImg" className="mx-auto" height={150} width={150} />
              <span className="position-absolute top-0 end-0 m-1 badge text-light bg-danger px-2 py-1 fs-12">
                # 1
              </span>
              <div className="position-absolute top-50 start-50 translate-middle z-n1 opacity-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  version="1.1"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 800 800"
                  width={400}
                  height={400}
                >
                  <defs>
                    <filter id="bbburst-blur-1" x="-100%" y="-100%" width="400%" height="400%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation={1} />
                    </filter>
                    <filter id="bbburst-blur-2" x="-100%" y="-100%" width="400%" height="400%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation={2} />
                    </filter>
                    <filter id="bbburst-blur-3" x="-100%" y="-100%" width="400%" height="400%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation={4} />
                    </filter>
                    <filter id="bbburst-blur-4" x="-100%" y="-100%" width="400%" height="400%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation={12} />
                    </filter>
                    <symbol id="bbburst-shape-1" viewBox="0 0 194 167">
                      <path d="m97 0 96.129 166.5H.871L97 0Z" />
                    </symbol>
                    <symbol id="bbburst-shape-4" viewBox="0 0 149 143">
                      <path d="M71.647 2.781c.898-2.764 4.808-2.764 5.706 0l15.445 47.534a3 3 0 0 0 2.853 2.073h49.98c2.906 0 4.115 3.719 1.764 5.427L106.96 87.193a2.999 2.999 0 0 0-1.09 3.354l15.445 47.534c.898 2.764-2.266 5.062-4.617 3.354l-40.435-29.378a3 3 0 0 0-3.526 0l-40.435 29.378c-2.351 1.708-5.515-.59-4.617-3.354L43.13 90.547a3 3 0 0 0-1.09-3.354L1.605 57.815c-2.35-1.708-1.142-5.427 1.764-5.427h49.98a3 3 0 0 0 2.853-2.073L71.647 2.781Z" />
                    </symbol>
                    <symbol id="bbburst-shape-6" viewBox="0 0 133 116">
                      <path d="M59.7487 10.2513c-13.6683-13.66839-35.8291-13.66839-49.4974 0-13.66839 13.6683-13.66839 35.8291 0 49.4974l49.4974-49.4974ZM66.5 66.5 41.7513 91.2487 66.5 115.997l24.7487-24.7483L66.5 66.5Zm56.249-6.7513c13.668-13.6683 13.668-35.8291 0-49.4974-13.669-13.66839-35.8294-13.66839-49.4977 0l49.4977 49.4974Zm-112.4977 0 31.5 31.5 49.4974-49.4974-31.5-31.5-49.4974 49.4974Zm80.9974 31.5 31.5003-31.5-49.4977-49.4974-31.5 31.5 49.4974 49.4974Z" />
                    </symbol>
                    <symbol id="bbburst-shape-8" viewBox="0 0 87 168">
                      <path
                        d="m12 12 31.2546 18.0749c16.4102 9.4902 20.014 31.6325 7.4603 45.8369L36.3296 92.1884c-12.5684 14.2206-8.9394 36.3916 7.5068 45.8636L75 156"
                        strokeWidth={14}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </symbol>
                    <symbol id="bbburst-shape-10" viewBox="0 0 145 145">
                      <circle cx="72.5" cy="72.5" r="61.5" fill="none" strokeWidth={22} />
                    </symbol>
                  </defs>
                  <use
                    xlinkHref="#bbburst-shape-6"
                    width="42.7645635972241"
                    opacity="-0.07170930593208524"
                    transform="matrix(1.6526711594398502,-0.5754807023313131,0.5754807023313131,1.6526711594398502,-208.95529848116416,-587.3516463083347)"
                    fill="#ff5c58"
                    filter="url(#bbburst-blur-4)"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <h5 className="text-dark mb-0">
                <IconifyIcon icon="ri:coins-fill" className="fs-24 text-primary align-middle" />{' '}
                19,343 Collected In This Month
              </h5>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Property Photos</CardTitle>
          </CardHeader>
          <CardBody>
            <Carousel indicators={false}>
              <CarouselItem className="carousel-item active">
                <Image
                  src={properties1}
                  height={305}
                  className="d-block w-100 rounded"
                  alt="img-6"
                />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon
                        icon="solar:home-bold-duotone"
                        width={24}
                        height={24}
                        className="fs-24 text-white"
                      />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        Dvilla Residences Batu
                      </Link>
                      <p className="text-muted mb-0">4604 , Philli Lane Kiowa</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image
                  src={properties2}
                  height={305}
                  className="d-block w-100 rounded"
                  alt="img-7"
                />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon
                        icon="solar:home-bold-duotone"
                        width={24}
                        height={24}
                        className="fs-24 text-white"
                      />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        PIK Villa House
                      </Link>
                      <p className="text-muted mb-0">27, Boulevard Cockeysville</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image
                  src={properties3}
                  height={305}
                  className="d-block w-100 rounded"
                  alt="img-5"
                />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon
                        icon="solar:home-bold-duotone"
                        width={24}
                        height={24}
                        className="fs-24 text-white"
                      />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        Tungis Luxury
                      </Link>
                      <p className="text-muted mb-0">900 , Creside WI 54913</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image
                  src={properties4}
                  height={305}
                  className="d-block w-100 rounded"
                  alt="img-5"
                />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon
                        icon="solar:buildings-3-bold-duotone"
                        width={24}
                        height={24}
                        className="fs-24 text-white"
                      />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        Luxury Apartment
                      </Link>
                      <p className="text-muted mb-0">223 , Creside Santa Maria</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem className="carousel-item">
                <Image
                  src={properties5}
                  height={305}
                  className="d-block w-100 rounded"
                  alt="img-5"
                />
                <div className="carousel-caption d-none d-md-block bg-light rounded p-2 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar bg-primary rounded flex-centered">
                      <IconifyIcon
                        icon="solar:home-bold-duotone"
                        width={24}
                        height={24}
                        className="fs-24 text-white"
                      />
                    </div>
                    <div>
                      <Link href="" className="text-dark fw-medium fs-16">
                        Weekend Villa MBH
                      </Link>
                      <p className="text-muted mb-0">980, Jim Rosa Lane Dublin</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </Carousel>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'}>Location</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="my-4" style={{ height: '228px' }}>
              <WorldVectorMap width="100%" options={salesLocationOptions} />
            </div>
            <div className="d-flex align-items-center bg-light justify-content-between p-3 rounded">
              <div>
                <h5 className="fw-medium mb-1 text-dark">Walker Art Center</h5>
                <p className="mb-2">Lincoln Drive Harrisburg, PA 17101 Belgium</p>
                <div className="d-flex gap-2 align-items-center">
                  <ul className="d-flex text-warning m-0 fs-18  list-unstyled">
                    <li>
                      <IconifyIcon icon="ri:star-fill" />
                    </li>
                    <li>
                      <IconifyIcon icon="ri:star-fill" />
                    </li>
                    <li>
                      <IconifyIcon icon="ri:star-fill" />
                    </li>
                    <li>
                      <IconifyIcon icon="ri:star-fill" />
                    </li>
                    <li>
                      <IconifyIcon icon="ri:star-half-line" />
                    </li>
                  </ul>
                  <p className="mb-0 fw-medium fs-15 text-dark">
                    4.5 <span className="text-muted fs-13">(5809 Review)</span>
                  </p>
                </div>
              </div>
              <div>
                <div className="avatar bg-dark rounded flex-centered">
                  <IconifyIcon
                    icon="solar:point-on-map-perspective-bold"
                    width={30}
                    height={30}
                    className="fs-30 text-light"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AgentDetails;
