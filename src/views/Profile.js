// fe/src/views/Profile.js
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
  const { user, getAccessTokenSilently } = useAuth0();
  const { userType, updateUserType } = useSession();

  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(userType || "");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loadingToken, setLoadingToken] = useState(false);

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
    if (!selectedRole || selectedRole === userType) {
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

  const handleGetToken = async () => {
    setLoadingToken(true);
    try {
      const token = await getAccessTokenSilently();

      // Decode the token to show basic info (don't do this in production for security)
      const tokenParts = token.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));

      setTokenInfo({
        token: token,
        payload: payload,
        expires: new Date(payload.exp * 1000).toLocaleString()
      });
    } catch (error) {
      console.error('Failed to get token:', error);
      setUpdateMessage('Failed to retrieve access token');
    } finally {
      setLoadingToken(false);
    }
  };

  const getCurrentRoleInfo = () => {
    return roles.find(role => role.value === userType) || null;
  };

  const currentRoleInfo = getCurrentRoleInfo();

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
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
          {/* Account Information */}
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
                    <Label className="fw-bold text-muted small">NICKNAME</Label>
                    <p className="mb-0">{user.nickname || "Not set"}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">LAST UPDATED</Label>
                    <p className="mb-0">{formatDate(user.updated_at)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">LOCALE</Label>
                    <p className="mb-0">{user.locale || "Not set"}</p>
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

          {/* Authentication Details */}
          <Card className="shadow-sm border-0 mb-4">
            <CardHeader className="bg-light border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon="shield-alt" className="me-2 text-primary" />
                Authentication Details
              </h5>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">PROVIDER</Label>
                    <div>
                      <Badge color="success" className="me-2">
                        <FontAwesomeIcon icon="check-circle" className="me-1" />
                        Auth0
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">EMAIL VERIFICATION</Label>
                    <div>
                      <Badge color={user.email_verified ? "success" : "warning"}>
                        <FontAwesomeIcon
                          icon={user.email_verified ? "check-circle" : "exclamation-triangle"}
                          className="me-1"
                        />
                        {user.email_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">SESSION TYPE</Label>
                    <p className="mb-0">Client-side (localStorage)</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <Label className="fw-bold text-muted small">CONNECTION</Label>
                    <p className="mb-0">{user.sub.split('|')[0] || "Unknown"}</p>
                  </div>
                </Col>
              </Row>

              <div className="mt-3">
                <Button
                  color="info"
                  size="sm"
                  onClick={handleGetToken}
                  disabled={loadingToken}
                >
                  {loadingToken ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Getting Token...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="key" className="me-2" />
                      Show Access Token Info
                    </>
                  )}
                </Button>
              </div>

              {tokenInfo && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6 className="fw-bold">Access Token Information</h6>
                  <div className="mb-2">
                    <Label className="fw-bold text-muted small">EXPIRES</Label>
                    <p className="mb-1 small">{tokenInfo.expires}</p>
                  </div>
                  <div className="mb-2">
                    <Label className="fw-bold text-muted small">AUDIENCE</Label>
                    <p className="mb-1 small font-monospace">{tokenInfo.payload.aud || "Not set"}</p>
                  </div>
                  <div className="mb-2">
                    <Label className="fw-bold text-muted small">SCOPES</Label>
                    <p className="mb-1 small">{tokenInfo.payload.scope || "No scopes"}</p>
                  </div>
                  <details className="mt-2">
                    <summary className="fw-bold text-muted small" style={{ cursor: 'pointer' }}>
                      VIEW TOKEN (Development Only)
                    </summary>
                    <pre className="small bg-white p-2 mt-2 border rounded" style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
                      {tokenInfo.token}
                    </pre>
                  </details>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Raw User Data */}
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-light border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon="code" className="me-2 text-primary" />
                Raw User Object
              </h5>
            </CardHeader>
            <CardBody>
              <pre className="small bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardBody>
          </Card>
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
                    className={`p-2 mb-2 rounded border ${userType === role.value ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                      }`}
                  >
                    <div className="d-flex align-items-center mb-1">
                      <FontAwesomeIcon
                        icon={role.icon}
                        className={`me-2 ${userType === role.value ? 'text-primary' : 'text-muted'
                          }`}
                      />
                      <span className={`fw-bold ${userType === role.value ? 'text-primary' : ''
                        }`}>
                        {role.label}
                      </span>
                      {userType === role.value && (
                        <Badge color="primary" size="sm" className="ms-auto">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="small text-muted mb-0">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                <h6 className="fw-bold text-warning">
                  <FontAwesomeIcon icon="info-circle" className="me-2" />
                  Note
                </h6>
                <p className="small mb-0">
                  Your role selection is stored locally in your browser.
                  You can change it anytime from this page.
                </p>
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