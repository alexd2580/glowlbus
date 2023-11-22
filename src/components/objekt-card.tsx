import * as React from "react";
import { Accordion, Button, Card, DropdownItemProps, Form, Icon } from "semantic-ui-react";
import * as R from "ramda";
import { map, filter } from "rxjs";

import { Condition, owlFile } from "../models/owl-file";

import { IdProps, ParentProps } from "../utils/generic-props";
import { useObservable, useObservableWithDefault } from "../utils/use-unwrap";
import { listAsOptions } from "../utils/list";

function disableOption(option: string, options: DropdownItemProps[]): DropdownItemProps[] {
    return options.map(R.when(x => x.value === option, x => ({ ...x, disabled: true })));
}

type ConditionFormProps = IdProps & ParentProps & { showLabels: boolean };
const ConditionForm = ({ id, parentId, showLabels }: ConditionFormProps) => {
    const { builtin, value } = useObservable(owlFile.conditions.byId(id));
    const disableExactly = useObservable(owlFile.datavalues.byId(parentId).pipe(
        filter(x => x !== undefined),
        map(datavalue => datavalue.conditionIds.length > 1),
    ));
    const options = useObservable(owlFile.builtins.values().pipe(map(listAsOptions)));
    const filteredOptions = disableExactly ? disableOption("exactly", options) : options;

    const addBuiltin = (value: string) => owlFile.builtins.add(value);
    const setBuiltin = (value: string) => owlFile.conditions.setField(id, "builtin", value);
    const setValue = (value: string) => owlFile.conditions.setField(id, "value", value)
    const removeCondition = () => owlFile.removeCondition(id, parentId);
    return (
        <Form size="tiny">
            <Form.Group>
                <Form.Dropdown
                    label={showLabels && "Builtin"}
                    placeholder="Builtin..."
                    width={5}
                    fluid
                    search
                    selection
                    allowAdditions
                    options={filteredOptions}
                    value={builtin}
                    onAddItem={(_, data) => addBuiltin(data.value as string)}
                    onChange={(_, data) => setBuiltin(data.value as string)}
                />
                <Form.Input
                    label={showLabels && "Value"}
                    placeholder='Value...'
                    fluid
                    width={3}
                    value={value}
                    onChange={event => setValue(event.target.value)}
                />
                <Form.Button
                    label={showLabels && "Remove"}
                    size="small"
                    icon='x'
                    color="red"
                    onClick={removeCondition}
                />
            </Form.Group>
        </Form>
    );
};

type AddConditionFormProps = ParentProps & { showLabels: boolean };
const AddConditionForm = ({ parentId, showLabels }: AddConditionFormProps) => {
    const options = useObservable(owlFile.builtins.values().pipe(map(listAsOptions)));

    const addBuiltin = (value: string) => owlFile.builtins.add(value);
    const isSome = (thing: any) => R.isNotNil(thing) && !R.isEmpty(thing);
    const addCondition = (builtin: string | undefined, value: string | undefined) => {
        if (isSome(builtin) || isSome(value)) {
            const newId = owlFile.conditions.add({ builtin, value });
            owlFile.datavalues.alterField(parentId, "conditionIds", R.append(newId));
        }
    };
    return (
        <Form size="tiny">
            <Form.Group>
                <Form.Dropdown
                    label={showLabels && "Builtin"}
                    placeholder="Builtin..."
                    width={5}
                    fluid
                    search
                    selection
                    allowAdditions
                    options={options}
                    onAddItem={(_, data) => addBuiltin(data.value as string)}
                    onChange={(_, data) => addCondition(data.value as string, undefined)}
                />
                <Form.Input
                    label={showLabels && "Value"}
                    placeholder='Value...'
                    fluid
                    width={3}
                    onBlur={event => addCondition(undefined, event.target.value)}
                />
            </Form.Group>
        </Form>
    );
};

const DatavalueAccordionItem = ({ id, parentId }: IdProps & ParentProps) => {
    const { field, instance, conditionIds } = useObservable(owlFile.datavalues.byId(id));
    const conditions = useObservableWithDefault(owlFile.datavalueConditions(id), () => []);
    const isExactly = conditions.length === 1 && conditions[0].builtin === "exactly";
    const options = useObservableWithDefault(owlFile.datavalueOptions(parentId).pipe(map(listAsOptions)), () => []);

    const accordionActive = useObservableWithDefault(owlFile.datavaluesExpanded.byId(id), () => false);
    const variablePart = `${field ?? "***"}(${instance ?? "***"})`;
    const stringifyCondition = (condition: Condition) => `${condition.builtin ?? "***"}(${condition.value})`;
    const conditionPart = R.join(" && ", conditions.map(stringifyCondition));
    let accordionTitle = `${variablePart} ${!R.isEmpty(conditions) ? "| " + conditionPart : ""}`;

    const addField = (value: string) => owlFile.addDatavalueOption(parentId, value);
    const setField = (value: string) => owlFile.datavalues.setField(id, "field", value);
    const setInstance = (value: string) => owlFile.datavalues.setField(id, "instance", value);
    const removeDatavalue = () => owlFile.removeDatavalue(id, parentId);
    const toggleAccordion = () => owlFile.datavaluesExpanded.alter(id, prev => !prev);

    return (
        <>
            <Accordion.Title
                active={accordionActive}
                index={id}
                onClick={toggleAccordion}
            >
                <Icon name='dropdown' />{accordionTitle}
            </Accordion.Title>
            <Accordion.Content active={accordionActive}>
                <Form size="small">
                    <Form.Group>
                        <Form.Dropdown
                            label="Datavalue"
                            placeholder="Datavalue..."
                            fluid
                            search
                            selection
                            allowAdditions
                            options={options}
                            width={5}
                            value={field}
                            onAddItem={(_, data) => addField(data.value as string)}
                            onChange={(_, data) => setField(data.value as string)}
                        />
                        <Form.Input
                            label="Variable"
                            placeholder="Variable name..."
                            iconPosition='left'
                            icon="edit"
                            fluid
                            width={3}
                            value={instance}
                            onChange={(_, data) => setInstance(data.value as string)}
                            disabled={isExactly}
                        />
                        <Form.Button label="Remove" icon='x' color="red" onClick={removeDatavalue} />
                    </Form.Group>
                </Form >
                {conditionIds.map((cId, index) =>
                    <ConditionForm
                        key={cId}
                        id={cId}
                        parentId={id}
                        showLabels={index === 0}
                    />
                )}
                {!isExactly &&
                    <AddConditionForm
                        key={conditionIds.length}
                        parentId={id}
                        showLabels={R.isEmpty(conditionIds)}
                    />
                }

            </Accordion.Content >
        </>
    );
};

export const ObjektCard = ({ id, parentId }: IdProps & ParentProps) => {
    const { name, klass, datavalueIds } = useObservable(owlFile.objekts.byId(id));
    const options = useObservable(owlFile.klasses.pipe(map(Object.keys), map(listAsOptions)));
    const setName = (value: string) => owlFile.objekts.setField(id, "name", value);
    const setKlass = (value: string) => owlFile.objekts.setField(id, "klass", value);
    const addDatavalue = () => {
        const newId = owlFile.datavalues.add({ field: undefined, instance: "", conditionIds: [] });
        owlFile.datavaluesExpanded.set(newId, true);
        owlFile.objekts.alterField(id, "datavalueIds", R.append(newId));
    }
    const removeObjekt = () => owlFile.removeObjekt(id, parentId);
    const setObjektHover = () => owlFile.hoveredObjekt.next(id);
    return (
        <Card
            style={{ width: "100%" }}
            onFocus={setObjektHover}
            onMouseEnter={setObjektHover}
        >
            {/* Generic objekt data. */}
            <Card.Content>
                <Form size="large">
                    <Form.Group style={{ margin: "0" }}>
                        <Form.Dropdown
                            placeholder="Class..."
                            fluid
                            search
                            selection
                            options={options}
                            width={5}
                            value={klass}
                            onChange={(_, data) => setKlass(data.value as string)}
                        />
                        <Form.Input
                            placeholder="Variable..."
                            width={5}
                            value={name}
                            onChange={event => setName(event.target.value as string)}
                        />
                    </Form.Group>
                </Form>
            </Card.Content>

            <Card.Content>
                {/* Objekt datavalues. */}
                <Accordion>
                    {datavalueIds.map(dId => <DatavalueAccordionItem key={dId} id={dId} parentId={id} />)}
                </Accordion>
            </Card.Content>

            <Card.Content extra>
                <Form.Field>
                    <Button.Group>
                        <Button icon="add" color="blue" content="Add datavalue" onClick={addDatavalue} />
                        <Button icon="x" color="red" content="Remove object" onClick={removeObjekt} />
                    </Button.Group>
                </Form.Field>
            </Card.Content>
        </Card>
    );
};
