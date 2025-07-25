import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loading from "../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useSession } from "../utils/sessionManager";

export const ProfileComponent = () => {
  const { user } = useAuth0();
  const {
    session,
    updateUserType,
    isAuthenticated: sessionAuthenticated
  } = useSession();

  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(session.userType || "");

  const roles = [
    {
      value: "Estudiante",
      label: "Student",
      icon: "graduation-cap",
      description: "Access internship opportunities and track your application process"
    },
    {
      value: "Administrativo",
      label: "Administrator",
      icon: "user-shield",
      description: "Manage system-wide operations and oversee internship processes"
    },
    {
      value: "Empresa",
      label: "Company",
      icon: "building",
      description: "Post internship opportunities and manage applications"
    }
  ];

  const handleRoleUpdate = async () => {
    if (!selectedRole || selectedRole === session.userType) {
      setUpdateMessage("Please select a different role to update.");
      return;
    }

    setIsUpdatingRole(true);
    setUpdateMessage("");

    try {
      await updateUserType(selectedRole);
      setUpdateMessage(`Role successfully updated to ${selectedRole}!`);
    } catch (error) {
      console.error('Failed to update role:', error);
      setUpdateMessage(`Failed to update role: ${error.message}`);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const getCurrentRoleInfo = () => {
    return roles.find(role => role.value === session.userType) || null;
  };

  const currentRoleInfo = getCurrentRoleInfo();

  // Format user registration date if available
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <Container className="mb-5">
      {/* Profile Header */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0">
            <CardBody className="p-4">
              <Row className="align-items-center">
                <Col md={3} className="text-center text-md-start mb-3 mb-md-0">
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="rounded-circle img-fluid shadow-sm"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                </Col>
                <Col md={9}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                    <div>
                      <h2 className="mb-2 text-primary">{user.name}</h2>
                      <p className="text-muted mb-2">
                        <FontAwesomeIcon icon="envelope" className="me-2" />
                        {user.email}
                      </p>
                      {user.email_verified && (
                        <Badge color="success" className="mb-2">
                          <FontAwesomeIcon icon="check-circle" className="me-1" />
                          Verified Email
                        </Badge>
                      )}
                      {!user.email_verified && (
                        <Badge color="warning" className="mb-2">
                          <FontAwesomeIcon icon="exclamation-triangle" className="me-1" />
                          Unverified Email
                        </Badge>
                      )}
                    </div>
                    <div className="text-center text-md-end mt-3 mt-md-0">
                      {currentRoleInfo && (
                        <div>
                          <Badge
                            color="primary"
                            pill
                            className="p-2 fs-6"
                          >
                            <FontAwesomeIcon icon={currentRoleInfo.icon} className="me-2" />
                            {currentRoleInfo.label}
                          </Badge>
                          <p className="small text-muted mt-2 mb-0">
                            Current Role
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* User Information */}
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            <CardHeader className="bg-light border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon="user" className="me-2 text-primary" />
                Account Information
              </h5>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">FULL NAME</Label>
                    <p className="mb-0">{user.name}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">EMAIL ADDRESS</Label>
                    <p className="mb-0">{user.email}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">USER ID</Label>
                    <p className="mb-0 font-monospace small">{user.sub}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">LAST UPDATED</Label>
                    <p className="mb-0">{formatJoinDate(user.updated_at)}</p>
                  </div>
                </Col>
              </Row>

              {currentRoleInfo && (
                <div className="mt-4 p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <FontAwesomeIcon
                      icon={currentRoleInfo.icon}
                      className="me-2 text-primary"
                    />
                    <span className="fw-bold">Current Role: {currentRoleInfo.label}</span>
                  </div>
                  <p className="text-muted mb-0 small">
                    {currentRoleInfo.description}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Session Information */}
          {sessionAuthenticated && (
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-light border-0">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon="server" className="me-2 text-primary" />
                  Session Information
                </h5>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <Label className="fw-bold text-muted small">SESSION STATUS</Label>
                      <div>
                        <Badge color="success" className="me-2">
                          <FontAwesomeIcon icon="check-circle" className="me-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <Label className="fw-bold text-muted small">SESSION ID</Label>
                      <p className="mb-0 font-monospace small">{session.sessionId || 'N/A'}</p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          )}
        </Col>

        {/* Role Management */}
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-light border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon="user-cog" className="me-2 text-primary" />
                Role Management
              </h5>
            </CardHeader>
            <CardBody>
              {updateMessage && (
                <Alert
                  color={updateMessage.includes('successfully') ? 'success' : 'danger'}
                  className="mb-3"
                >
                  {updateMessage}
                </Alert>
              )}

              <Form>
                <FormGroup>
                  <Label for="roleSelect" className="fw-bold">Select Your Role</Label>
                  <Input
                    type="select"
                    id="roleSelect"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={isUpdatingRole}
                  >
                    <option value="">Choose a role...</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                <Button
                  color="primary"
                  onClick={handleRoleUpdate}
                  disabled={isUpdatingRole || !selectedRole}
                  className="w-100"
                >
                  {isUpdatingRole ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="save" className="me-2" />
                      Update Role
                    </>
                  )}
                </Button>
              </Form>

              <div className="mt-4">
                <Label className="fw-bold text-muted small">AVAILABLE ROLES</Label>
                {roles.map((role) => (
                  <div
                    key={role.value}
                    className={`p-2 mb-2 rounded border ${session.userType === role.value ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                      }`}
                  >
                    <div className="d-flex align-items-center mb-1">
                      <FontAwesomeIcon
                        icon={role.icon}
                        className={`me-2 ${session.userType === role.value ? 'text-primary' : 'text-muted'
                          }`}
                      />
                      <span className={`fw-bold black${session.userType === role.value ? 'text-primary' : ''
                        }`}>
                        {role.label}
                      </span>
                      {session.userType === role.value && (
                        <Badge color="primary" size="sm" className="ms-auto">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="black small text-muted mb-0">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});