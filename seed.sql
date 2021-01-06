INSERT INTO department (id, department_name)
    VALUES (1, "IT"),
    (2,"Sales"),
    (3,"Administration"),
    (4, "Product Development");


INSERT INTO  emp_role (id, title, salary, department_id)
    VALUES (1, "IT Tech", 60000, 1),
        (2, "Sales Representative", 60000, 2),
        (3, "Administrator", 100000, 3),
        (4, "Engineer", 100000, 4);


INSERT INTO employee (id, first_name, last_name, role_id)
VALUES (1,"Seth", "Staggs", 1),
(2, "Steve", "Blume", 2),
(3, "Ken", "Bone", 3),
(4,"Hank", "Hill",4);