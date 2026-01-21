import styled from '@emotion/styled';
import { Card } from 'web-check-live/components/Form/Card';
import Heading from 'web-check-live/components/Form/Heading';
import colors from 'web-check-live/styles/colors';

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${colors.primaryTransparent};
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: bold;
  color: ${colors.textColor};
`;

const Value = styled.span`
  color: ${colors.textColorSecondary};
  text-align: right;
`;

const AlertValue = styled(Value)`
  color: ${colors.danger};
  font-weight: bold;
`;

const SafeValue = styled(Value)`
  color: ${colors.success};
`;

const CmsDiagnosticsCard = (props: { data: any, title: string, actionButtons: any }): JSX.Element => {
  const { cms, exposedFiles, errorsFound, debugMode } = props.data;

  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      <Row>
        <Label>Detected CMS</Label>
        <Value>{cms}</Value>
      </Row>
      <Row>
        <Label>Debug Mode Enabled</Label>
        {debugMode ? <AlertValue>Yes (Risk!)</AlertValue> : <SafeValue>No</SafeValue>}
      </Row>
      
      <Heading as="h4" size="small" color={colors.primary}>Exposed Files</Heading>
      {exposedFiles && exposedFiles.length > 0 ? (
        exposedFiles.map((file: string, index: number) => (
          <Row key={index}>
            <Label>{file}</Label>
            <AlertValue>Exposed</AlertValue>
          </Row>
        ))
      ) : (
        <Row><Label>No sensitive files detected</Label><SafeValue>✓ Safe</SafeValue></Row>
      )}

      <Heading as="h4" size="small" color={colors.primary}>Error Logs / Issues</Heading>
      {errorsFound && errorsFound.length > 0 ? (
        errorsFound.map((error: string, index: number) => (
          <Row key={index}>
            <Label>Issue</Label>
            <AlertValue>{error}</AlertValue>
          </Row>
        ))
      ) : (
        <Row><Label>No critical errors found</Label><SafeValue>✓ Safe</SafeValue></Row>
      )}
    </Card>
  );
};

export default CmsDiagnosticsCard;
