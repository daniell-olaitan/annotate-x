import { Link } from './Link.js';
import { Popup } from './Popup.js';
import { Button } from './Button.js';
import { ImageList } from './ImageList.js';
import { Annotator } from './Annotator.js';
import { AnnotationList } from './AnnotationList.js';
import { Form } from './Form.js';

import htm from 'https://esm.sh/htm';
import { h } from 'https://esm.sh/preact';
import { useRef, useState, useEffect } from 'https://esm.sh/preact/hooks';

const html = htm.bind(h);

export function AnnotationBoard({ projectId, setError, setLoading, setSaving }) {
  const projectList = useRef([]);
  const projectListTitle = useRef('no projects');
  let imageNamesRef = useRef([]);

  const [project, setProject] = useState({});
  const [projectName, setProjectName] = useState('');
  const [projectClasses, setProjectClasses] = useState({});

  const [formImages, setFormImages] = useState([]);
  const [formClasses, setFormClasses] = useState('');
  const [formProjectName, setFormProjectName] = useState('');

  const annotationSet = useRef({});
  const [annotations, setAnnotations] = useState([]);

  const [imageUrls, setImageUrls] = useState({});

  const [imageUrl, setImageUrl] = useState({});
  const [selectedImage, setSelectedImage] = useState('');

  const [popupPos, setPopupPos] = useState(null);
  const [popupPosNew, setPopupPosNew] = useState(null);
  const [popupPosEdit, setPopupPosEdit] = useState(null);
  const [subPopupPos, setSubPopupPos] = useState(null);
  const [popupPosAdd, setPopupPosAdd] = useState(null);
  const [projectPopupPos, setProjectPopupPos] = useState(null);
  const [subPopupTitle, setSubPopupTitle] = useState('');

  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    const fetchProject = async (pId) => {
      setLoading(true);

      try {
        let data;
        const res = await fetch(`/projects/${pId}`);

        if (!res.ok) throw new Error('Failed to fetch project');
        data = await res.json();
        setProject(data.data);
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const imgUrls = {};

    if (Object.keys(project).length > 0) {
      project.images.forEach(img => {
        const parts = img.url.split('/');
        let fileName = parts[parts.length - 1];

        fileName = fileName.split('.').slice(0, -1).join('.');
        imgUrls[fileName] = img.url;

        annotationSet.current[fileName] = img.annotations;
      });

      imageNamesRef.current = Object.keys(imgUrls);

      setImageUrls(imgUrls);
      setProjectName(project.name);
      setProjectClasses(project.classes);

      setSelectedImage(imageNamesRef.current[0]);
    }
  }, [project]);

  useEffect(() => {
    if (selectedImage) {
      setImageUrl({[selectedImage]: imageUrls[selectedImage]});
    } else {
      setImageUrl({});
    }
  }, [selectedImage]);

  useEffect(() => {
    if (Object.keys(imageUrl).length > 0) {
      setAnnotations(annotationSet.current[Object.keys(imageUrl)[0]]);
    }
  }, [imageUrl]);

  useEffect(() => {
    if (Object.keys(imageUrl).length > 0) {
      annotationSet.current[Object.keys(imageUrl)[0]] = annotations;
    }
  }, [annotations]);

  const handleClear = (e) => {
    setAnnotations([]);
  };

  const handleNext = (e) => {
    let img;
    const imageNames = imageNamesRef.current;
    const index = imageNames.findIndex(imageName => imageName === selectedImage);
    const nextImage = index + 1;

    if (nextImage === imageNames.length) {
      img = imageNames[0];
    } else {
      img = imageNames[nextImage];
    }

    setSelectedImage(img);
  };

  const handlePrev = (e) => {
    let img;
    const imageNames = imageNamesRef.current;
    const index = imageNames.findIndex(imageName => imageName === selectedImage);
    const prevImage = index - 1;

    if (prevImage === -1) {
      img = imageNames[imageNames.length-1];
    } else {
      img = imageNames[prevImage];
    }

    setSelectedImage(img);
  };

  const handleProjectOptionClick = (e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    setProjectPopupPos({x, y});
  };

  const handleProjectOptionSelect = (option, e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    if (option && Object.keys(option).length > 0) {
      if (option.value === 'new') {
        setFormClasses('');
        setFormProjectName('');

        setPopupPosNew({x, y});
      } else if (option.value === 'open') {
        projectList.current = [];
        projectListTitle.current = 'no projects';

        const fetchProjects = async () => {
          setLoading(true);

          try {
            let data;
            const res = await fetch('/projects');

            if (!res.ok) throw new Error('Failed to fetch projects');
            data = await res.json();
            if (Object.keys(data.data).length > 0) {
              projectListTitle.current = 'Your Projects';
              for (const [name, id] of Object.entries(data.data)) {
                projectList.current.push({key: name, value: id});
              }
            }

            setPopupPos({x, y});

          } catch (err) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
          } finally {
            setLoading(false);
          }
        };

        fetchProjects();
      } else if (option.value === 'edit') {
        setFormClasses(Object.keys(project.classes).join(';'));
        setFormProjectName(project.name);

        setPopupPosEdit({x, y});
      } else if (option.value === 'images') {
        setPopupPosAdd({x, y});
      } else if (option.value === 'export') {
        // TODO: export the project
      }
    }

    setProjectPopupPos(null);
  };

  const handleProjectSelect = (project) => {
    if (project && Object.keys(project).length > 0) {
      window.location.href = `/project/${project.value}`;
    }

    setPopupPos(null);
  };

  const onContextMenu = (label, e) => {
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    setSubPopupTitle(label.key);
    setSelectedProjectId(label.value);
    setSubPopupPos({x, y});
  };

  const handleSubPopupItemSelect = (item, e) => {
    if (item && Object.keys(item).length > 0) {
        // TODO: delete project
    }

    setSubPopupPos(null);
  };

  const createProject = () => {
    const colors = [
      "#F0F8FF", "#E6E6FA", "#D3D3D3", "#DCDCDC", "#F5F5F5", "#FFF0F5", "#FAFAD2", "#FFFACD",
      "#FFFAF0", "#F0FFF0", "#F5FFFA", "#F0FFCC", "#FFFFE0", "#E0FFFF", "#E0F7FA", "#B2EBF2",
      "#80DEEA", "#4DD0E1", "#26C6DA", "#00BCD4", "#00ACC1", "#0097A7", "#00796B", "#004D40",
      "#00897B", "#009688", "#00796B", "#004D40", "#4CAF50", "#388E3C", "#2E7D32", "#1B5E20",
      "#C2185B", "#D32F2F", "#C2185B", "#880E4F", "#8E24AA", "#7B1FA2", "#6A1B9A", "#4A148C",
      "#9C27B0", "#8E24AA", "#673AB7", "#512DA8", "#3F51B5", "#303F9F", "#1E88E5", "#1976D2",
      "#1565C0", "#0288D1", "#039BE5"
    ];

    const classes = []
    const project = new FormData();

    formClasses.split(';').forEach((cls, index) => {
      if (cls.trim()) {
        classes.push({[cls.trim()]: colors[index]});
      }
    });

    project.append('name', formProjectName.trim());
    project.append('classes', JSON.stringify(classes));

    return project;
  };

  const handleNewProjectSubmit = (e) => {
    e.preventDefault();

    const createNewProject = async (project) => {
      setSaving('Creating Project...');

      try {
        let data;
        const res = await fetch('/projects', {
          method: 'POST',
          body: project,
        });

        if (!res.ok) throw new Error('Failed to create project');
        data = await res.json();
        window.location.href = `/project/${data.data.id}`;
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    if (!formProjectName.trim() || !formClasses.trim()) {
      setError('Project name and classes are required');
      setTimeout(() => setError(''), 3000);
      setPopupPosNew(null);

      return;
    }

    const project = createProject();

    formImages.forEach((img, index) => {
      project.append(`image-${index}`, img);
    });

    createNewProject(project);
    setPopupPosNew(null);
  };

  const handleEditProjectSubmit = (e) => {
    e.preventDefault(); e.preventDefault();

    const editProject = async (project) => {
      setSaving('Saving...');

      try {
        let data;
        const res = await fetch(`/projects/${projectId}`, {
          method: 'PATCH',
          body: project,
        });

        if (!res.ok) throw new Error('Failed to edit project');
        data = await res.json();
        window.location.href = `/project/${data.data.id}`;
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    if (!formProjectName.trim() || !formClasses.trim()) {
      setError('Project name and classes are required');
      setTimeout(() => setError(''), 3000);
      setPopupPosEdit(null);

      return;
    }

    const project = createProject();

    editProject(project);
    setPopupPosEdit(null);
  };

  const handleAddImageSubmit = (e) => {
    e.preventDefault(); e.preventDefault();

    const editProject = async (project) => {
      setSaving('Adding images...');

      try {
        let data;
        const res = await fetch(`/projects/${projectId}`, {
          method: 'PATCH',
          body: project,
        });

        if (!res.ok) throw new Error('Failed to add images');
        data = await res.json();

        if (data.message.toLowerCase() === 'no images added') {
          setSaving('');
          return;
        }

        window.location.href = `/project/${data.data.id}`;
      } catch (err) {
        setError(err.message);
        setTimeout(() => setError(''), 3000);
      } finally {
        setSaving('');
      }
    };

    const project = new FormData();

    formImages.forEach((img, index) => {
      project.append(`image-${index}`, img);
    });

    editProject(project);
    setPopupPosAdd(null);
  };

  return html`
    <main id="main" class="flex-grow flex py-6 w-full">
      <div class="flex flex-col gap-4 w-1/5 border-r border-gray-200 px-4">
        <div class="flex gap-6 py-2">
          <${Link}
            text="Menu"
            handleClick=${handleProjectOptionClick}
          />

          ${projectPopupPos &&
            html`
              <${Popup}
                labels=${[
                  {key: 'New', value: 'new'},
                  {key: 'Open', value: 'open'},
                  {key: 'Edit', value: 'edit'},
                  {key: 'Add Images', value: 'images'},
                  {key: 'Export', value: 'export'}
                ]}
                popupPos=${projectPopupPos}
                onSelect=${handleProjectOptionSelect}
                title="Project Options"
              />
            `
          }

          ${popupPosNew &&
            html`
              <${Form}
                title="Create a Project"
                classes=${formClasses}
                popupPos=${popupPosNew}
                setClasses=${setFormClasses}
                projectName=${formProjectName}
                setPopupPos=${setPopupPosNew}
                handleSubmit=${handleNewProjectSubmit}
                includeImage=${true}
                setProjectName=${setFormProjectName}
                setImages=${setFormImages}
              />
            `
          }

          ${popupPos &&
            html`
              <${Popup}
                labels=${projectList.current}
                popupPos=${popupPos}
                onSelect=${handleProjectSelect}
                title=${projectListTitle.current}
                onContextMenu=${onContextMenu}
              />
            `
          }

          ${subPopupPos &&
            html`
              <${Popup}
                labels=${[{key: 'delete', value: 'delete'}]}
                popupPos=${subPopupPos}
                onSelect=${handleSubPopupItemSelect}
                title=${subPopupTitle}
                onContextMenu=${onContextMenu}
              />
            `
          }

          ${popupPosEdit &&
            html`
              <${Form}
                title="Edit Project"
                classes=${formClasses}
                popupPos=${popupPosEdit}
                setClasses=${setFormClasses}
                projectName=${formProjectName}
                setPopupPos=${setPopupPosEdit}
                handleSubmit=${handleEditProjectSubmit}
                setProjectName=${setFormProjectName}
              />
            `
          }

          ${popupPosAdd &&
            html`
              <${Form}
                title="Add Images"
                popupPos=${popupPosAdd}
                setPopupPos=${setPopupPosAdd}
                handleSubmit=${handleAddImageSubmit}
                includeImage=${true}
                imageOnly=${true}
                setImages=${setFormImages}
              />
            `
          }
        </div>

        <${ImageList}
          imageUrls=${imageUrls}
          setImageUrls=${setImageUrls}
          selectedImage=${selectedImage}
          setSelectedImage=${setSelectedImage}
        />
        <${AnnotationList}
          annotations=${annotations}
          setAnnotations=${setAnnotations}
        />
      </div>

      ${Object.keys(project).length === 0
          ? html`<p class="py-16 px-32 h2-c font-semibold">open or create a project</p>`
          : html`
              <div class="flex flex-col gap-4 px-12 w-4/5">
                <div class="flex">
                  <p class="h2-c mr-auto">${projectName}</p>
                  <div class="flex ml-6 gap-12">
                    <${Button}
                      text="finish"
                      classes="thin-btn-c"
                    />
                    <div class="flex gap-4">
                      <${Button}
                        text="prev"
                        handleClick=${handlePrev}
                      />
                      <${Button}
                        text="next"
                        handleClick=${handleNext}
                      />
                    </div>
                    <div class="flex gap-4">
                      <${Button}
                        text="clear"
                        classes="thin-btn-c"
                        handleClick=${handleClear}
                      />
                      <${Button}
                        text="save"
                        classes="thin-btn-c"
                      />
                    </div>
                  </div>
                </div>
                <div class="flex-grow">
                  <${Annotator}
                    imageUrl=${imageUrl}
                    classes=${projectClasses}
                    annotations=${annotations}
                    setAnnotations=${setAnnotations}
                  />
                </div>
              </div>
            `
       }
    </main>
  `;
}
