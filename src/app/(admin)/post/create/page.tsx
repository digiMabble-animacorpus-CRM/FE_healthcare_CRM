import FileUpload from '@/components/FileUpload'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import CreatePost from './components/CreatePost'
import CreatePostCard from './components/CreatePostCard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blog Create' }

const PostCreatePage = () => {
  return (
    <>
      <PageTitle title="Blog Create" subName="Blog" />
      <Row>
        <Col xl={3} lg={4}>
          <CreatePostCard />
        </Col>
        <Col xl={9} lg={8}>
          <FileUpload title="" />
          <CreatePost />
        </Col>
      </Row>
    </>
  )
}

export default PostCreatePage
